import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { bookings, bookingActivityLog, bookingPayments } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "@/lib/database";

const schema = z.object({
  additionalHours: z.number().int().positive(),
  notes: z.string().optional(),
  clientApproved: z.boolean().refine((val) => val === true, {
    message: "Client approval is required",
  }),
});

const databaseService = new DatabaseService();

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const params = await props.params;
    const bookingCode = params.code;
    const body = await req.json();

    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { additionalHours, notes } = result.data;

    const booking = await databaseService.getBookingByCode(bookingCode);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.statusCode !== "in_progress") {
      return NextResponse.json(
        { error: "Extension is only allowed when booking is in progress" },
        { status: 400 }
      );
    }

    const currentExtendedHours = booking.extendedHours || 0;
    const currentExtensionAmount = parseFloat(booking.extensionAmount?.toString() || "0");

    const newExtendedHours = currentExtendedHours + additionalHours;
    const calculatedAmount = additionalHours * 100;
    const newExtensionAmount = currentExtensionAmount + calculatedAmount;

    // Execute sequential updates (neon-http does not support transactions)
    await db
      .update(bookings)
      .set({
        extendedHours: newExtendedHours,
        extensionAmount: newExtensionAmount.toString(),
        extensionRequestedAt: new Date(),
        dateModified: new Date(),
      })
      .where(eq(bookings.bookingId, booking.bookingId));

    // Update booking_payments so the invoice & UI totals match perfectly
    const paymentRecords = await db
      .select()
      .from(bookingPayments)
      .where(eq(bookingPayments.bookingId, booking.bookingId))
      .limit(1);

    if (paymentRecords.length > 0) {
      const paymentRecord = paymentRecords[0];
      const currentTotalAmount = parseFloat(paymentRecord.totalAmount?.toString() || "0");
      const currentOriginalAmount = parseFloat(paymentRecord.originalAmount?.toString() || "0");
      const currentBalanceAmount = parseFloat(paymentRecord.balanceAmount?.toString() || "0");

      const newTotalAmount = (currentTotalAmount + calculatedAmount).toString();
      const newOriginalAmount = (currentOriginalAmount + calculatedAmount).toString();
      const newBalanceAmount = (currentBalanceAmount + calculatedAmount).toString();

      await db
        .update(bookingPayments)
        .set({
          totalAmount: newTotalAmount,
          originalAmount: newOriginalAmount,
          balanceAmount: newBalanceAmount,
          updatedAt: new Date(),
        })
        .where(eq(bookingPayments.paymentId, paymentRecord.paymentId));
    }

    await db.insert(bookingActivityLog).values({
      bookingId: booking.bookingId,
      actorType: "HOUSEMAID",
      actorId: booking.housemaidId?.toString() || "SYSTEM",
      audience: "ALL",
      action: "REQUEST_EXTENSION",
      statusCode: booking.statusCode,
      title: "Booking Extended",
      message: `Extension added: +${additionalHours} hours (₱${calculatedAmount})`,
      changedFields: { extendedHours: newExtendedHours, extensionAmount: newExtensionAmount, notes },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Booking extended successfully",
      data: {
        extendedHours: newExtendedHours,
        extensionAmount: newExtensionAmount,
      }
    });

  } catch (error) {
    console.error("Error extending booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
