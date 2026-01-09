import { NextResponse } from 'next/server';
import { meiliClient, BOOKINGS_INDEX } from '@/lib/meilisearch';
import { db } from "@/server/db";
import { bookings, customerProfiles, addresses, customerAddresses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Fetch all bookings from DB with joins
        const allBookings = await db
            .select({
                booking: bookings,
                customerName: customerProfiles.customerName,
                address: addresses.addressLine,
                city: addresses.cityName,
                landmark: addresses.landmark,
            })
            .from(bookings)
            .leftJoin(customerProfiles, eq(bookings.customerId, customerProfiles.customerId))
            .leftJoin(customerAddresses, eq(bookings.customerAddressId, customerAddresses.customerAddressId))
            .leftJoin(addresses, eq(customerAddresses.addressId, addresses.addressId));

        if (!allBookings.length) {
            return NextResponse.json({ message: 'No bookings to sync' });
        }

        // 2. Format data for Meilisearch (using snake_case to match index config)
        const documents = allBookings.map(row => ({
            id: row.booking.bookingId, // Primary Key
            booking_code: row.booking.bookingId,
            customer_name: row.customerName,
            address: row.address,
            city: row.city,
            landmark: row.landmark || '',
            status_code: row.booking.statusCode,
            service_date: row.booking.serviceDate,
            housemaid_id: row.booking.housemaidId,
            // Add other searchable fields if needed
        }));

        // 3. Add documents to index
        const index = meiliClient.index(BOOKINGS_INDEX);

        // Configure filterable attributes
        await index.updateFilterableAttributes([
            'status_code',
            'service_date',
            'housemaid_id'
        ]);

        // Configure sortable attributes
        await index.updateSortableAttributes([
            'service_date'
        ]);

        // Configure searchable attributes (optional but good for relevance)
        await index.updateSearchableAttributes([
            'booking_code',
            'customer_name',
            'address',
            'city',
            'landmark'
        ]);

        const task = await index.addDocuments(documents);

        return NextResponse.json({
            success: true,
            message: 'Sync started',
            taskUid: task.taskUid
        });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
