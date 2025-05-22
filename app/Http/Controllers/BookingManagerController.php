<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;

class BookingManagerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 30);
            $checkinDate = $request->input('checkin_date');
            $checkoutDate = $request->input('checkout_date');

            $query = BookingManager::with('room');

            if ($checkinDate && $checkoutDate) {
                $query->whereBetween('checkin_date', [$checkinDate, $checkoutDate]);
            }

            $bookings = $query->paginate($perPage);

            return response()->json([
                'data' => $bookings->items(), // Ensure data is an array
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch bookings: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after_or_equal:checkin_date',
                'check_status' => 'required|in:not checked in,checked in,checked out',
            ]);

            $booking = BookingManager::findOrFail($id);
            $booking->checkin_date = $request->input('checkin_date');
            $booking->checkout_date = $request->input('checkout_date');
            $booking->check_status = $request->input('check_status');
            $booking->save();

            return response()->json($booking, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update booking: ' . $e->getMessage()], 500);
        }
    }
}