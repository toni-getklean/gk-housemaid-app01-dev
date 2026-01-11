import { db } from "../server/db";
import { eq, and, sql, inArray, asc, desc } from "drizzle-orm";
import { BOOKING_TRACKING_MESSAGES } from "./bookings";
import {
  housemaids,
  userAuthAttempts,
  otpVerifications,
  bookings,
  status,
  transportationDetails,
  transportationLegs,
  idCounters,
  customerProfiles,
  customerAddresses,
  addresses,
  bookingPayments,
  bookingActivityLog,
  housemaidRatings,
  customerRatings,
  housemaidAvailability,
} from "../server/db/schema";

import { parseISO } from "date-fns";

// Type aliases for the schema types
type Housemaid = typeof housemaids.$inferSelect;
type AuthAttempt = typeof userAuthAttempts.$inferSelect;
type OtpVerification = typeof otpVerifications.$inferSelect;
type Booking = typeof bookings.$inferSelect;
type Status = typeof status.$inferSelect;
type TransportationDetails = typeof transportationDetails.$inferSelect;
type TransportationLeg = typeof transportationLegs.$inferSelect;

type BookingWithParsedFields = Booking & {
  parsedServiceDate?: Date;
  parsedStartTime?: string;
  statusDisplayName?: string;
  // Customer data (JOINed from customerProfiles)
  customerName: string | null;
  contactNumber: string | null;
  // Address data (JOINed from addresses via customerAddresses)
  address: string | null;
  city: string | null;
  landmark: string | null;
  addressLink: string | null;
  // Transportation data (JOINed from transportationDetails)
  totalTransportationCost?: string | null;
  transportationLegs?: TransportationLeg[];
  paymentMethod?: string | null;
  totalAmount?: string | null;
  // Reschedule data
  rescheduleRequestedAt?: Date | null;
  rescheduleRequestedBy?: string | null;
  rescheduleReasonId?: string | null;
  rescheduleProposedAt?: Date | null;
  rescheduleApprovedBy?: string | null;
  rescheduleApprovedAt?: Date | null;
  rescheduleCount?: number;
  assignmentAttemptCount?: number;
};

// Export for use in API routes and frontend
export type { BookingWithParsedFields as Booking };


// Helper function to generate IDs with prefix format
// Helper function to generate business codes (e.g., HM25-00001)


export class DatabaseService {
  /**
   * Generates a business code with the given prefix (e.g., HM25-00001).
   * Automatically handles counter increment and creation.
   */
  async generateCode(prefix: string): Promise<string> {
    // Check if counter exists, increments it if it does
    const result = await db
      .update(idCounters)
      .set({ lastNumber: sql`${idCounters.lastNumber} + 1` })
      .where(eq(idCounters.prefix, prefix))
      .returning({ lastNumber: idCounters.lastNumber });

    if (result.length === 0) {
      // Create counter if it doesn't exist (e.g., new year or new prefix)
      const insertResult = await db
        .insert(idCounters)
        .values({ prefix, lastNumber: 1 })
        .returning({ lastNumber: idCounters.lastNumber });

      if (insertResult.length > 0) {
        return `${prefix}-${insertResult[0].lastNumber.toString().padStart(5, '0')}`;
      }
      throw new Error(`Could not generate code for prefix: ${prefix}`);
    }

    const paddedNumber = result[0].lastNumber.toString().padStart(5, '0');
    return `${prefix}-${paddedNumber}`;
  }


  private parseStartTime(timeString: string): string {
    if (!timeString) return "00:00";

    try {
      const startTimeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!startTimeMatch) return "00:00";

      let hours = parseInt(startTimeMatch[1], 10);
      const minutes = startTimeMatch[2];
      const period = startTimeMatch[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch (error) {
      console.error("Error parsing time:", timeString, error);
      return "00:00";
    }
  }

  private enrichBooking(
    bookingData: {
      booking: typeof bookings.$inferSelect;
      customerName: string | null;
      contactNumber: string | null;
      address: string | null;
      city: string | null;
      landmark: string | null;
      addressLink: string | null;
      totalTransportationCost?: string | null;
      transportationLegs?: TransportationLeg[];
      paymentMethod?: string | null;
      totalAmount?: string | null;
    },
    statusList: Status[]
  ): BookingWithParsedFields {
    const { booking, customerName, contactNumber, address, city, landmark, addressLink, totalTransportationCost, transportationLegs, paymentMethod, totalAmount } = bookingData;

    const enriched: BookingWithParsedFields = {
      ...booking,
      parsedStartTime: this.parseStartTime(booking.time),
      customerName,
      contactNumber,
      address,
      city,
      landmark,
      addressLink,
      totalTransportationCost,
      transportationLegs,
      paymentMethod,
      totalAmount,
      rescheduleRequestedAt: booking.rescheduleRequestedAt,
      rescheduleRequestedBy: booking.rescheduleRequestedBy,
      rescheduleReasonId: booking.rescheduleReasonId,
      rescheduleProposedAt: booking.rescheduleProposedAt,
      rescheduleApprovedBy: booking.rescheduleApprovedBy,
      rescheduleApprovedAt: booking.rescheduleApprovedAt,
      rescheduleCount: booking.rescheduleCount,
      assignmentAttemptCount: booking.assignmentAttemptCount,
    };

    if (booking.serviceDate) {
      try {
        enriched.parsedServiceDate = parseISO(booking.serviceDate);
      } catch (error) {
        console.error("Error parsing service_date:", booking.serviceDate);
      }
    }

    const status = statusList.find((s) => s.statusCode === booking.statusCode);
    if (status) {
      enriched.statusDisplayName = status.statusDisplayName;
    }

    return enriched;
  }


  async findHousemaidByFacebookId(facebookId: string): Promise<Housemaid | null> {
    try {
      const result = await db
        .select()
        .from(housemaids)
        .where(eq(housemaids.facebookId, facebookId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error finding housemaid by Facebook ID:", error);
      return null;
    }
  }

  async findHousemaidByFacebookNameAndMobile(
    facebookName: string,
    mobileNumber: string
  ): Promise<Housemaid | null> {
    try {
      // Normalize phone number: strip leading + if present
      const normalizedMobile = mobileNumber.replace(/^\+/, '');

      const result = await db
        .select()
        .from(housemaids)
        .where(
          and(
            eq(housemaids.facebookName, facebookName),
            eq(housemaids.mobile, normalizedMobile)
          )
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error finding housemaid by Facebook name and mobile:", error);
      return null;
    }
  }

  async updateHousemaidAccessToken(
    housemaidId: number,
    accessToken: string,
    expiresAt: string,
    facebookId?: string
  ): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {
        facebookAccessToken: accessToken,
        tokenExpiresAt: new Date(expiresAt),
        lastLogin: new Date(),
      };

      if (facebookId) {
        updateData.facebookId = facebookId;
      }

      await db
        .update(housemaids)
        .set(updateData)
        .where(eq(housemaids.housemaidId, housemaidId));

      return true;
    } catch (error) {
      console.error("Error updating housemaid access token:", error);
      return false;
    }
  }

  async clearHousemaidAccessToken(housemaidId: number): Promise<boolean> {
    try {
      const result = await db
        .update(housemaids)
        .set({
          facebookAccessToken: null,
          tokenExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(housemaids.housemaidId, housemaidId))
        .returning({ housemaidId: housemaids.housemaidId });

      return result.length > 0;
    } catch (error) {
      console.error("Error clearing housemaid access token:", error);
      return false;
    }
  }

  async getAuthAttempt(
    providerUserId: string,
    authProvider: string = 'FACEBOOK'
  ): Promise<AuthAttempt | null> {
    try {
      const result = await db
        .select()
        .from(userAuthAttempts)
        .where(
          and(
            eq(userAuthAttempts.providerUserId, providerUserId),
            eq(userAuthAttempts.authProvider, authProvider)
          )
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting auth attempt:", error);
      return null;
    }
  }

  async getAuthAttemptByMobile(
    mobileNumber: string,
    userType: string = 'HOUSEMAID',
    authProvider: string = 'FACEBOOK'
  ): Promise<AuthAttempt | null> {
    try {
      const result = await db
        .select()
        .from(userAuthAttempts)
        .where(
          and(
            eq(userAuthAttempts.mobileNumber, mobileNumber),
            eq(userAuthAttempts.userType, userType),
            eq(userAuthAttempts.authProvider, authProvider)
          )
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting auth attempt by mobile:", error);
      return null;
    }
  }

  async getAuthAttemptById(id: number): Promise<AuthAttempt | null> {
    try {
      const result = await db
        .select()
        .from(userAuthAttempts)
        .where(eq(userAuthAttempts.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting auth attempt by ID:", error);
      return null;
    }
  }

  async createAuthAttempt(
    mobileNumber: string,
    providerUserId: string,
    type: "otp" | "login" | "registration",
    userType: string = 'HOUSEMAID',
    authProvider: string = 'FACEBOOK'
  ): Promise<boolean> {
    try {
      const now = new Date();
      // ID is auto-increment, do not generate it.

      const newAttempt = {
        // id field removed, let DB handle it
        userType,
        authProvider,
        providerUserId,
        mobileNumber,
        otpRequestCount: type === "otp" ? 1 : 0,
        lastOtpRequestedAt: type === "otp" ? now : null,
        otpVerificationFailCount: 0,
        lastOtpVerificationFailAt: null,
        registrationFailCount: type === "registration" ? 1 : 0,
        lastRegistrationAttemptAt: type === "registration" ? now : null,
        loginFailCount: type === "login" ? 1 : 0,
        lastLoginAttemptAt: type === "login" ? now : null,
        createdAt: now,
      };

      await db.insert(userAuthAttempts).values(newAttempt);
      return true;
    } catch (error) {
      console.error("Error creating auth attempt:", error);
      return false;
    }
  }

  async updateAuthAttempt(
    attemptId: number,
    type: "otp" | "login" | "registration" | "otp_verify_fail",
    increment: boolean = true
  ): Promise<boolean> {
    try {
      const now = new Date();
      const attempt = await this.getAuthAttemptById(attemptId);

      if (!attempt) return false;

      let updateData: Record<string, any> = {};

      if (type === "otp") {
        updateData = {
          otpRequestCount: increment
            ? (attempt.otpRequestCount ?? 0) + 1
            : 0,
          lastOtpRequestedAt: now,
        };
      } else if (type === "otp_verify_fail") {
        updateData = {
          otpVerificationFailCount: increment
            ? (attempt.otpVerificationFailCount ?? 0) + 1
            : 0,
          lastOtpVerificationFailAt: now,
        };
      } else if (type === "login") {
        updateData = {
          loginFailCount: increment
            ? (attempt.loginFailCount ?? 0) + 1
            : 0,
          lastLoginAttemptAt: now,
        };
      } else if (type === "registration") {
        updateData = {
          registrationFailCount: increment
            ? (attempt.registrationFailCount ?? 0) + 1
            : 0,
          lastRegistrationAttemptAt: now,
        };
      }

      await db
        .update(userAuthAttempts)
        .set(updateData)
        .where(eq(userAuthAttempts.id, attemptId));

      return true;
    } catch (error) {
      console.error("Error updating auth attempt:", error);
      return false;
    }
  }

  async createOTPVerification(
    providerUserId: string,
    mobileNumber: string,
    otpCode: string,
    expiresAt: string,
    userType: string = 'HOUSEMAID',
    authProvider: string = 'FACEBOOK'
  ): Promise<boolean> {
    try {
      // ID is auto-increment

      const newOTP = {
        // id removed
        userType,
        authProvider,
        providerUserId,
        mobileNumber,
        otpCode,
        isVerified: false,
        expiresAt: new Date(expiresAt),
        createdAt: new Date(),
      };

      await db.insert(otpVerifications).values(newOTP);
      return true;
    } catch (error) {
      console.error("Error creating OTP verification:", error);
      return false;
    }
  }

  async verifyOTP(
    providerUserId: string,
    mobileNumber: string,
    otpCode: string,
    userType: string = 'HOUSEMAID',
    authProvider: string = 'FACEBOOK'
  ): Promise<{ success: boolean; expired?: boolean; alreadyUsed?: boolean }> {
    try {
      const result = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.providerUserId, providerUserId),
            eq(otpVerifications.mobileNumber, mobileNumber),
            eq(otpVerifications.otpCode, otpCode),
            eq(otpVerifications.userType, userType),
            eq(otpVerifications.authProvider, authProvider)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return { success: false };
      }

      const otpRecord = result[0];
      const now = new Date();
      const expiresAt = otpRecord.expiresAt ? new Date(otpRecord.expiresAt) : now;

      if (now > expiresAt) {
        return { success: false, expired: true };
      }

      if (otpRecord.isVerified) {
        return { success: false, alreadyUsed: true };
      }

      await db
        .update(otpVerifications)
        .set({ isVerified: true })
        .where(eq(otpVerifications.id, otpRecord.id));

      return { success: true };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false };
    }
  }

  async getStatuses(): Promise<Status[]> {
    try {
      const result = await db.select().from(status);
      return result;
    } catch (error) {
      console.error("Error fetching statuses:", error);
      return [];
    }
  }

  async getBookingsByHousemaidId(housemaidId: number): Promise<BookingWithParsedFields[]> {
    try {
      console.log("Fetching bookings by housemaid ID:", housemaidId);



      const [bookingsResult, statusList] = await Promise.all([
        db
          .select({
            booking: bookings,
            customerName: customerProfiles.customerName,
            contactNumber: customerProfiles.contactNumber,
            address: addresses.addressLine,
            city: addresses.cityName,
            landmark: addresses.landmark,
            addressLink: addresses.addressLink,
            // Select transportation info
            transportationId: transportationDetails.transportationId,
            totalTransportationCost: transportationDetails.totalTransportationCost,
            // Select payment info
            paymentMethod: bookingPayments.paymentMethodCode,
            totalAmount: bookingPayments.totalAmount,
          })
          .from(bookings)
          .leftJoin(customerProfiles, eq(bookings.customerId, customerProfiles.customerId))
          .leftJoin(customerAddresses, eq(bookings.customerAddressId, customerAddresses.customerAddressId))
          .leftJoin(addresses, eq(customerAddresses.addressId, addresses.addressId))
          .leftJoin(transportationDetails, eq(bookings.bookingId, transportationDetails.bookingId))
          .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
          .where(eq(bookings.housemaidId, housemaidId)),
        this.getStatuses(),
      ]);

      // Fetch transportation legs for found transportation details
      const transportationIds = bookingsResult
        .map(b => b.transportationId)
        .filter((id): id is number => id !== null);

      let allLegs: TransportationLeg[] = [];
      if (transportationIds.length > 0) {
        allLegs = await db
          .select()
          .from(transportationLegs)
          .where(inArray(transportationLegs.transportationId, transportationIds))
          .orderBy(asc(transportationLegs.legSequence));
      }

      console.log("Bookings result:", bookingsResult.length);
      console.log("Status list:", statusList.length);

      return bookingsResult.map((row) => {
        const legs = row.transportationId
          ? allLegs.filter(leg => leg.transportationId === row.transportationId)
          : [];

        return this.enrichBooking({
          ...row,
          transportationLegs: legs
        }, statusList);
      });
    } catch (error) {
      console.error("Error fetching bookings by housemaid ID:", error);
      return [];
    }
  }


  async getBookingByCode(bookingCode: string): Promise<BookingWithParsedFields | null> {
    try {
      const [bookingsResult, statusList] = await Promise.all([
        db
          .select({
            booking: bookings,
            customerName: customerProfiles.customerName,
            contactNumber: customerProfiles.contactNumber,
            address: addresses.addressLine,
            city: addresses.cityName,
            landmark: addresses.landmark,
            addressLink: addresses.addressLink,
            // Select transportation info
            transportationId: transportationDetails.transportationId,
            totalTransportationCost: transportationDetails.totalTransportationCost,
            // Select payment info
            paymentMethod: bookingPayments.paymentMethodCode,
            totalAmount: bookingPayments.totalAmount,
          })
          .from(bookings)
          .leftJoin(customerProfiles, eq(bookings.customerId, customerProfiles.customerId))
          .leftJoin(customerAddresses, eq(bookings.customerAddressId, customerAddresses.customerAddressId))
          .leftJoin(addresses, eq(customerAddresses.addressId, addresses.addressId))
          .leftJoin(transportationDetails, eq(bookings.bookingId, transportationDetails.bookingId))
          .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
          .where(eq(bookings.bookingCode, bookingCode))
          .limit(1),
        this.getStatuses(),
      ]);

      if (bookingsResult.length === 0) return null;

      const row = bookingsResult[0];
      let legs: TransportationLeg[] = [];

      if (row.transportationId) {
        legs = await db
          .select()
          .from(transportationLegs)
          .where(eq(transportationLegs.transportationId, row.transportationId))
          .orderBy(asc(transportationLegs.legSequence));
      }

      return this.enrichBooking({
        ...row,
        transportationLegs: legs
      }, statusList);
    } catch (error) {
      console.error("Error fetching booking by code:", error);
      return null;
    }
  }

  async getBookingById(bookingId: number): Promise<BookingWithParsedFields | null> {
    try {
      const [bookingsResult, statusList] = await Promise.all([
        db
          .select({
            booking: bookings,
            customerName: customerProfiles.customerName,
            contactNumber: customerProfiles.contactNumber,
            address: addresses.addressLine,
            city: addresses.cityName,
            landmark: addresses.landmark,
            addressLink: addresses.addressLink,
            // Select transportation info
            transportationId: transportationDetails.transportationId,
            totalTransportationCost: transportationDetails.totalTransportationCost,
            // Select payment info
            paymentMethod: bookingPayments.paymentMethodCode,
            totalAmount: bookingPayments.totalAmount,
          })
          .from(bookings)
          .leftJoin(customerProfiles, eq(bookings.customerId, customerProfiles.customerId))
          .leftJoin(customerAddresses, eq(bookings.customerAddressId, customerAddresses.customerAddressId))
          .leftJoin(addresses, eq(customerAddresses.addressId, addresses.addressId))
          .leftJoin(transportationDetails, eq(bookings.bookingId, transportationDetails.bookingId))
          .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
          .where(eq(bookings.bookingId, bookingId))
          .limit(1),
        this.getStatuses(),
      ]);

      if (bookingsResult.length === 0) return null;

      const row = bookingsResult[0];
      let legs: TransportationLeg[] = [];

      if (row.transportationId) {
        legs = await db
          .select()
          .from(transportationLegs)
          .where(eq(transportationLegs.transportationId, row.transportationId))
          .orderBy(asc(transportationLegs.legSequence));
      }

      return this.enrichBooking({
        ...row,
        transportationLegs: legs
      }, statusList);
    } catch (error) {
      console.error("Error fetching booking by ID:", error);
      return null;
    }
  }


  async updateBookingStatus(
    bookingId: number,
    newStatus: string,
    additionalUpdates?: Record<string, any>
  ): Promise<boolean> {
    try {
      // 1. Determine which datetime field to update based on status
      const now = new Date().toISOString();
      const statusUpdates: Record<string, any> = {
        statusCode: newStatus,
        dateModified: new Date(),
        ...additionalUpdates,
      };

      if (newStatus === "accepted") statusUpdates.housemaidAcceptedAt = now;
      if (newStatus === "dispatched") statusUpdates.housemaidDispatchedAt = now;
      if (newStatus === "on_the_way") statusUpdates.housemaidDepartedAt = now;
      if (newStatus === "arrived") statusUpdates.housemaidArrivedAt = now;
      if (newStatus === "in_progress") statusUpdates.housemaidCheckInTime = now;
      if (newStatus === "completed") {
        statusUpdates.housemaidCompletedAt = now;
        statusUpdates.housemaidCheckOutTime = now;
      }
      if (newStatus === "cancelled" || newStatus === "rescheduled") {
        // These might have specific fields handled in additionalUpdates or logic elsewhere
      }

      // 2. Update Booking
      await db
        .update(bookings)
        .set(statusUpdates)
        .where(eq(bookings.bookingId, bookingId));

      // 3. Log Activity
      const messageDef = BOOKING_TRACKING_MESSAGES[newStatus];
      if (messageDef) {
        await db.insert(bookingActivityLog).values({
          bookingId,
          actorType: "housemaid", // Defaulting to housemaid for now as per context
          actorId: "0", // Placeholder if we don't have the exact user ID here easily, or pass it in
          audience: "housemaid",
          action: "STATUS_CHANGE",
          statusCode: newStatus,
          title: messageDef.title,
          message: messageDef.message,
          createdAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return false;
    }
  }

  async getBookingActivityLog(bookingId: number) {
    try {
      return await db
        .select()
        .from(bookingActivityLog)
        .where(eq(bookingActivityLog.bookingId, bookingId))
        .orderBy(desc(bookingActivityLog.createdAt));
    } catch (error) {
      console.error("Error fetching booking activity log:", error);
      return [];
    }
  }

  async uploadProofOfArrival(
    bookingId: number,
    imageUrl: string,
    metadata?: string
  ): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {
        proofOfArrivalImg: imageUrl,
      };

      if (metadata) {
        updateData.proofOfArrivalData = metadata;
      }

      await db
        .update(bookings)
        .set(updateData)
        .where(eq(bookings.bookingId, bookingId));

      return true;
    } catch (error) {
      console.error("Error uploading proof of arrival:", error);
      return false;
    }
  }

  async updateTransportationDetails(
    bookingId: number,
    housemaidId: number,
    transportationData: {
      total_transportation_cost?: string;
      commute_to_client_infos?: any[];
      return_from_client_infos?: any[];
    }
  ): Promise<boolean> {
    try {
      const now = new Date();

      // Helper to sanitize cost - handles NaN, undefined, null, empty strings
      const sanitizeCost = (cost: any): string => {
        if (cost === null || cost === undefined || cost === '') return '0';
        const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
        if (isNaN(numCost)) return '0';
        return numCost.toString();
      };

      // Helper to validate mode - throws error if invalid
      const validateAndGetMode = (leg: any): string => {
        const validModes = ['jeepney', 'bus', 'tricycle', 'mrt_lrt', 'taxi_grab', 'motorcycle', 'walking'];
        const modeValue = leg?.transport_mode || leg?.mode;
        if (typeof modeValue === 'string' && validModes.includes(modeValue)) {
          return modeValue;
        }
        throw new Error(`Invalid transportation mode: ${modeValue || 'empty'}`);
      };

      // Check if record exists
      const existingRecords = await db
        .select()
        .from(transportationDetails)
        .where(eq(transportationDetails.bookingId, bookingId))
        .limit(1);

      let transportationId: number;

      if (existingRecords.length > 0) {
        transportationId = existingRecords[0].transportationId;
        // Update parent
        await db
          .update(transportationDetails)
          .set({
            totalTransportationCost: sanitizeCost(transportationData.total_transportation_cost),
            transportationSubmittedAt: now,
            updatedAt: now,
          })
          .where(eq(transportationDetails.transportationId, transportationId));
      } else {
        // Create new
        const insertResult = await db.insert(transportationDetails).values({
          bookingId,
          housemaidId,
          totalTransportationCost: sanitizeCost(transportationData.total_transportation_cost),
          transportationSubmittedAt: now,
          createdAt: now,
          updatedAt: now,
        }).returning({ transportationId: transportationDetails.transportationId });

        transportationId = insertResult[0].transportationId;
      }

      // Handle Legs (Child Table) - Using transaction for atomic delete + insert
      // Generate all leg IDs first (outside transaction)
      const legsToInsert: any[] = [];

      const processLegs = async (legs: any[] | undefined, direction: 'TO_CLIENT' | 'RETURN') => {
        if (!legs || !Array.isArray(legs)) return;

        for (let i = 0; i < legs.length; i++) {
          const leg = legs[i];
          // ID is auto-generated

          legsToInsert.push({
            transportationId: transportationId,
            direction,
            legSequence: i + 1,
            mode: validateAndGetMode(leg),
            cost: sanitizeCost(leg.cost),
            receiptUrl: leg.receipt_img || leg.receiptUrl || leg.receipt_url || null,
            notes: leg.notes || null,
            createdAt: now,
            updatedAt: now,
          });
        }
      };

      await processLegs(transportationData.commute_to_client_infos, 'TO_CLIENT');
      await processLegs(transportationData.return_from_client_infos, 'RETURN');

      // Delete existing legs first, then insert new ones
      // Note: Not using transaction as Neon HTTP driver doesn't support it
      // This is eventually consistent - if insert fails after delete, data may be lost
      // but this is acceptable for this use case as user can retry
      await db.delete(transportationLegs).where(eq(transportationLegs.transportationId, transportationId));

      // Insert new legs if any
      if (legsToInsert.length > 0) {
        await db.insert(transportationLegs).values(legsToInsert);
      }

      return true;
    } catch (error) {
      console.error("Error updating transportation details:", error);
      return false;
    }
  }

  async getTransportationDetailsByBookingId(
    bookingId: number
  ): Promise<TransportationDetails | null> {
    try {
      const result = await db
        .select()
        .from(transportationDetails)
        .where(eq(transportationDetails.bookingId, bookingId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting transportation details:", error);
      return null;
    }
  }

  /**
   * Retrieves dashboard statistics and booking list for a housemaid.
   */
  async getDashboardStats(housemaidId: number) {
    try {
      const now = new Date();
      // Start and End of current month for filtering
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      // Start and End of today
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // 1. Fetch Lists
      const statusList = await this.getStatuses();

      // Common fields selection
      const selectFields = {
        booking: bookings,
        customerName: customerProfiles.customerName,
        contactNumber: customerProfiles.contactNumber,
        address: addresses.addressLine,
        city: addresses.cityName,
        landmark: addresses.landmark,
        addressLink: addresses.addressLink,
        transportationId: transportationDetails.transportationId,
        paymentMethod: bookingPayments.paymentMethodCode,
        totalAmount: bookingPayments.totalAmount,
      };

      // Base query builder
      const buildQuery = (conditions: any[]) => {
        return db
          .select(selectFields)
          .from(bookings)
          .leftJoin(customerProfiles, eq(bookings.customerId, customerProfiles.customerId))
          .leftJoin(customerAddresses, eq(bookings.customerAddressId, customerAddresses.customerAddressId))
          .leftJoin(addresses, eq(customerAddresses.addressId, addresses.addressId))
          .leftJoin(transportationDetails, eq(bookings.bookingId, transportationDetails.bookingId))
          .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
          .where(and(eq(bookings.housemaidId, housemaidId), ...conditions));
      };

      // A. For Review (pending_review)
      const forReviewResults = await buildQuery([
        eq(bookings.statusCode, "pending_review")
      ]).orderBy(asc(bookings.serviceDate), asc(bookings.time));

      // B. Today's Jobs (accepted/dispatched/on_the_way/arrived/in_progress + serviceDate is today)
      // Exclude cancelled/completed/pending_review from "Today's Agenda" typically?
      // Or just matches date? Usually active jobs.
      const todayResults = await buildQuery([
        eq(bookings.serviceDate, startOfToday.toISOString().split('T')[0]),
        inArray(bookings.statusCode, ['accepted', 'dispatched', 'on_the_way', 'arrived', 'in_progress'])
      ]).orderBy(asc(bookings.time));

      // C. Upcoming Jobs (accepted/dispatched + serviceDate > today)
      const upcomingResults = await buildQuery([
        sql`${bookings.serviceDate} > ${endOfToday.toISOString().split('T')[0]}`,
        inArray(bookings.statusCode, ['accepted', 'dispatched'])
      ]).orderBy(asc(bookings.serviceDate), asc(bookings.time));


      // 2. Calculate Stats

      // Count "For Review"
      const countForReview = forReviewResults.length;

      // Count "Today's Jobs"
      const countToday = todayResults.length;

      // Count "This Month" (Completed Jobs this month)
      // We need a specific query for this to cover the whole month
      const completedThisMonth = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(
          and(
            eq(bookings.housemaidId, housemaidId),
            eq(bookings.statusCode, 'completed'),
            sql`${bookings.serviceDate} >= ${startOfMonth.toISOString().split('T')[0]}`,
            sql`${bookings.serviceDate} <= ${endOfMonth.toISOString().split('T')[0]}`
          )
        );
      const countThisMonth = Number(completedThisMonth[0]?.count || 0);

      // Sum "Earnings" (Sum of totalAmount for Completed Jobs this month)
      const earningsResult = await db
        .select({ total: sql<string>`sum(${bookingPayments.totalAmount})` })
        .from(bookings)
        .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
        .where(
          and(
            eq(bookings.housemaidId, housemaidId),
            eq(bookings.statusCode, 'completed'),
            sql`${bookings.serviceDate} >= ${startOfMonth.toISOString().split('T')[0]}`,
            sql`${bookings.serviceDate} <= ${endOfMonth.toISOString().split('T')[0]}`
          )
        );

      const earnings = parseFloat(earningsResult[0]?.total || "0");


      // 3. enrich and format lists
      const enrichList = (list: any[]) => list.map(row => this.enrichBooking({ ...row, transportationLegs: [] }, statusList));

      return {
        stats: {
          today: countToday,
          forReview: countForReview,
          earnings: earnings,
          thisMonth: countThisMonth
        },
        lists: {
          forReview: enrichList(forReviewResults),
          today: enrichList(todayResults),
          upcoming: enrichList(upcomingResults)
        }
      };

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        stats: { today: 0, forReview: 0, earnings: 0, thisMonth: 0 },
        lists: { forReview: [], today: [], upcoming: [] }
      };
    }
  }

  /**
   * Retrieves profile information for a housemaid.
   */
  async getHousemaidProfile(housemaidId: number) {
    try {
      // 1. Get Basic Profile & Location
      const profileData = await db
        .select({
          housemaid: housemaids,
          address: addresses.addressLine,
          city: addresses.cityName,
          province: addresses.cityName // Fallback or distinct field if available
        })
        .from(housemaids)
        .leftJoin(addresses, eq(housemaids.addressId, addresses.addressId))
        .where(eq(housemaids.housemaidId, housemaidId))
        .limit(1);

      if (!profileData || profileData.length === 0) {
        return null;
      }

      const maid = profileData[0].housemaid;
      const location = profileData[0].city ? `${profileData[0].city}` : profileData[0].address || "Unknown Location";

      // 2. Get Completed Jobs Count
      const jobsCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(and(
          eq(bookings.housemaidId, housemaidId),
          eq(bookings.statusCode, 'completed')
        ));

      const completedJobs = Number(jobsCountResult[0]?.count || 0);

      // 3. Get Average Rating
      const ratingResult = await db
        .select({ avg: sql<string>`avg(${housemaidRatings.rating})` })
        .from(housemaidRatings)
        .where(eq(housemaidRatings.housemaidId, housemaidId));

      const rating = parseFloat(ratingResult[0]?.avg || "0");

      return {
        ...maid,
        location,
        completedJobs,
        rating: Number(rating.toFixed(1))
      };

    } catch (error) {
      console.error("Error fetching housemaid profile:", error);
      return null;
    }
  }

  /**
   * Retrieves specific client rating for a booking.
   */
  async getClientRating(bookingId: number) {
    try {
      const result = await db
        .select()
        .from(customerRatings)
        .where(eq(customerRatings.bookingId, bookingId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting client rating:", error);
      return null;
    }
  }

  /**
   * Submits a rating for a client for a specific booking.
   * Ensures one rating per booking.
   */
  async submitClientRating(data: {
    bookingId: number;
    housemaidId: number;
    customerId: number;
    rating: number;
    feedback?: string;
  }) {
    try {
      // 1. Check if rating exists
      const existing = await this.getClientRating(data.bookingId);
      if (existing) {
        throw new Error("Rating already submitted for this booking");
      }

      // 2. Insert Rating
      const result = await db
        .insert(customerRatings)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error submitting client rating:", error);
      throw error;
    }
  }

  /**
   * Retrieves availability and active bookings for a given month.
   * Merges implicit availability with exceptions.
   */
  async getAvailability(housemaidId: number, month: number, year: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      // 1. Get Availability Exceptions (ABSENT or HALF_DAY)
      const availabilityExceptions = await db
        .select()
        .from(housemaidAvailability)
        .where(
          and(
            eq(housemaidAvailability.housemaidId, housemaidId),
            sql`EXTRACT(MONTH FROM ${housemaidAvailability.availabilityDate}) = ${month}`,
            sql`EXTRACT(YEAR FROM ${housemaidAvailability.availabilityDate}) = ${year}`
          )
        );

      // 2. Get Active Bookings (Overrides Availability)
      const activeStatuses = ['pending_review', 'accepted', 'dispatched', 'on_the_way', 'in_progress'];
      const activeBookings = await db
        .select({
          bookingId: bookings.bookingId,
          serviceDate: bookings.serviceDate,
          statusCode: bookings.statusCode,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.housemaidId, housemaidId),
            inArray(bookings.statusCode, activeStatuses),
            sql`EXTRACT(MONTH FROM ${bookings.serviceDate}) = ${month}`,
            sql`EXTRACT(YEAR FROM ${bookings.serviceDate}) = ${year}`
          )
        );

      return {
        exceptions: availabilityExceptions,
        bookings: activeBookings
      };
    } catch (error) {
      console.error("Error fetching availability:", error);
      return { exceptions: [], bookings: [] };
    }
  }

  /**
   * Updates availability for a specific date.
   * Implements Exception-Only Logic:
   * - ABSENT/HALF_DAY -> Save Record
   * - FULL_DAY (Available) -> Delete Record
   * - Validates against active bookings.
   */
  async updateAvailability(data: {
    housemaidId: number;
    date: string; // YYYY-MM-DD
    status: 'AVAILABLE' | 'ABSENT';
    timeCommitment?: 'FULL_DAY' | 'HALF_DAY' | 'HALF_DAY_AM' | 'HALF_DAY_PM';
    reason?: string;
  }) {
    try {
      // 1. Check for Active Bookings (Lock)
      const activeStatuses = ['pending_review', 'accepted', 'dispatched', 'on_the_way', 'in_progress'];
      const conflictingBooking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.housemaidId, data.housemaidId),
            eq(bookings.serviceDate, data.date),
            inArray(bookings.statusCode, activeStatuses)
          )
        )
        .limit(1);

      if (conflictingBooking.length > 0) {
        throw new Error("Cannot edit availability for a date with an active booking.");
      }

      // 2. Handle Logic
      // If AVAILABLE + FULL_DAY -> DELETE Record (Restore implicit default)
      if (data.status === 'AVAILABLE' && data.timeCommitment === 'FULL_DAY') {
        await db
          .delete(housemaidAvailability)
          .where(
            and(
              eq(housemaidAvailability.housemaidId, data.housemaidId),
              eq(housemaidAvailability.availabilityDate, data.date)
            )
          );
        return { success: true, action: 'deleted' };
      }

      // Else (ABSENT or HALF_DAY) -> UPSERT Record
      // Check if exists first to decide insert vs update
      const existing = await db
        .select()
        .from(housemaidAvailability)
        .where(
          and(
            eq(housemaidAvailability.housemaidId, data.housemaidId),
            eq(housemaidAvailability.availabilityDate, data.date)
          )
        )
        .limit(1);

      const record = {
        housemaidId: data.housemaidId,
        availabilityDate: data.date,
        statusCode: data.status,
        timeCommitment: data.status === 'ABSENT' ? null : data.timeCommitment, // ABSENT clears commitment
        reason: data.reason,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db
          .update(housemaidAvailability)
          .set(record)
          .where(eq(housemaidAvailability.availabilityId, existing[0].availabilityId));
      } else {
        await db.insert(housemaidAvailability).values({
          ...record,
          createdAt: new Date()
        });
      }

      return { success: true, action: 'saved' };

    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  }
}

// lib/database.ts
let _databaseService: DatabaseService | null = null;

export function getDatabaseService() {
  if (!_databaseService) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    _databaseService = new DatabaseService();
  }
  return _databaseService;
}
