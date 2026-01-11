import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService, Booking } from "@/lib/database";
import { isAfter, isBefore, parseISO, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // Secure Session Check
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  if (!session || !session.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const housemaidId = Number(session.sub);
  const statusFilter = searchParams.get("status");
  const dateFilter = searchParams.get("date");
  const searchTerm = searchParams.get("search") || "";

  try {
    const databaseService = getDatabaseService();
    let bookings = await databaseService.getBookingsByHousemaidId(Number(housemaidId));


    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      const statusCodes = statusFilter.split(",");
      bookings = bookings.filter((b) => statusCodes.includes(b.statusCode));
    }

    // Apply date filter
    if (dateFilter && dateFilter !== "all") {
      const filterDate = parseISO(dateFilter);
      const startDate = startOfDay(filterDate);
      const endDate = endOfDay(filterDate);

      bookings = bookings.filter((b) => {
        if (!b.parsedServiceDate) return false;
        return (
          !isBefore(b.parsedServiceDate, startDate) &&
          !isAfter(b.parsedServiceDate, endDate)
        );
      });
    }

    // Apply search filter (bookingId, customerName, address)
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      bookings = bookings.filter(
        (b) =>
          b.bookingId.toString().includes(term) ||
          (b.customerName && b.customerName.toLowerCase().includes(term)) ||
          (b.address && b.address.toLowerCase().includes(term)) ||
          (b.city && b.city.toLowerCase().includes(term)) ||
          (b.landmark && b.landmark.toLowerCase().includes(term))
      );
    }

    // Sort by service_date (ascending) then parsedStartTime (ascending)
    bookings.sort((a, b) => {
      // Primary sort: service_date
      if (a.parsedServiceDate && b.parsedServiceDate) {
        const dateCompare =
          a.parsedServiceDate.getTime() - b.parsedServiceDate.getTime();
        if (dateCompare !== 0) return dateCompare;
      } else if (a.parsedServiceDate) {
        return -1;
      } else if (b.parsedServiceDate) {
        return 1;
      }

      // Secondary sort: parsedStartTime
      const timeA = a.parsedStartTime || "00:00";
      const timeB = b.parsedStartTime || "00:00";
      return timeA.localeCompare(timeB);
    });

    return NextResponse.json({
      bookings,
      total: bookings.length,
    });
  } catch (fallbackError) {
    console.error("Fallback error in GET /api/bookings:", fallbackError);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }



  /*
  * Meilisearch implementation
  */

  // try {
  //   const index = meiliClient.index(BOOKINGS_INDEX);

  //   // Build Filters
  //   const filterConditions = [`housemaid_id = "${housemaidId}"`];

  //   if (statusFilter && statusFilter !== "all") {
  //     // statusFilter is comma-separated: "accepted,dispatched"
  //     // Meilisearch IN operator: status_code IN ["accepted", "dispatched"]
  //     const statuses = statusFilter.split(',').map(s => `"${s}"`).join(', ');
  //     filterConditions.push(`status_code IN [${statuses}]`);
  //   }

  //   if (dateFilter && dateFilter !== "all") {
  //     // Assuming dateFilter is YYYY-MM-DD or ISO string
  //     // For exact match on service_date string from SheetDB
  //     // Note: If service_date in Meilisearch is ISO string, we might need range or exact match depending on format
  //     // Here assuming exact match for simplicity as per SheetDB format
  //     filterConditions.push(`service_date = "${dateFilter}"`);
  //   }

  //   // Execute Search
  //   const searchResults = await index.search(searchTerm, {
  //     filter: filterConditions.join(' AND '),
  //     sort: ['service_date:asc'],
  //     limit: 50, // Pagination limit
  //   });

  //   // Transform hits to Booking type
  //   // Note: Meilisearch hits might need enrichment (like parsed dates) if used directly
  //   // But for now we return them as is, frontend handles date parsing
  //   const bookings = searchResults.hits.map(hit => ({
  //     ...hit,
  //     // Re-apply enrichment if needed, or rely on frontend
  //     // For consistency with SheetDB return, we might want to ensure fields match
  //   }));

  //   return NextResponse.json({
  //     bookings: bookings,
  //     total: searchResults.estimatedTotalHits,
  //   });

  // } catch (error) {
  //   console.error("Meilisearch error, falling back to SheetDB:", error);

  //   // FALLBACK: Keep your existing SheetDB logic here in case Meilisearch is down
  //   try {
  //     // Fetch all bookings for the housemaid
  //     let bookings = await sheetDB.getBookingsByHousemaidId(housemaidId);

  //     // Apply status filter
  //     if (statusFilter && statusFilter !== "all") {
  //       const statusCodes = statusFilter.split(",");
  //       bookings = bookings.filter((b) => statusCodes.includes(b.status_code));
  //     }

  //     // Apply date filter
  //     if (dateFilter && dateFilter !== "all") {
  //       const filterDate = parseISO(dateFilter);
  //       const startDate = startOfDay(filterDate);
  //       const endDate = endOfDay(filterDate);

  //       bookings = bookings.filter((b) => {
  //         if (!b.parsedServiceDate) return false;
  //         return (
  //           !isBefore(b.parsedServiceDate, startDate) &&
  //           !isAfter(b.parsedServiceDate, endDate)
  //         );
  //       });
  //     }

  //     // Apply search filter (booking_code, customer_name, address)
  //     if (searchTerm && searchTerm.trim() !== "") {
  //       const term = searchTerm.toLowerCase().trim();
  //       bookings = bookings.filter(
  //         (b) =>
  //           b.booking_code.toLowerCase().includes(term) ||
  //           b.customer_name.toLowerCase().includes(term) ||
  //           (b.address && b.address.toLowerCase().includes(term)) ||
  //           (b.city && b.city.toLowerCase().includes(term)) ||
  //           (b.landmark && b.landmark.toLowerCase().includes(term))
  //       );
  //     }

  //     // Sort by service_date (ascending) then parsedStartTime (ascending)
  //     bookings.sort((a, b) => {
  //       // Primary sort: service_date
  //       if (a.parsedServiceDate && b.parsedServiceDate) {
  //         const dateCompare =
  //           a.parsedServiceDate.getTime() - b.parsedServiceDate.getTime();
  //         if (dateCompare !== 0) return dateCompare;
  //       } else if (a.parsedServiceDate) {
  //         return -1;
  //       } else if (b.parsedServiceDate) {
  //         return 1;
  //       }

  //       // Secondary sort: parsedStartTime
  //       const timeA = a.parsedStartTime || "00:00";
  //       const timeB = b.parsedStartTime || "00:00";
  //       return timeA.localeCompare(timeB);
  //     });

  //     return NextResponse.json({
  //       bookings,
  //       total: bookings.length,
  //     });
  //   } catch (fallbackError) {
  //     console.error("Fallback error in GET /api/bookings:", fallbackError);
  //     return NextResponse.json(
  //       { error: "Failed to fetch bookings" },
  //       { status: 500 }
  //     );
  //   }
  // }
}
