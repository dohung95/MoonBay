<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            return response()->json(['error' => 'Failed to fetch bookings: ' + $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after_or_equal:checkin_date',
                'check_status' => 'required|in:not checked in,checked in,checked out',
                'actual_check_in' => 'nullable|date',
                'actual_check_out' => 'nullable|date|after_or_equal:actual_check_in',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $booking = BookingManager::findOrFail($id);
            $booking->update($request->only([
                'checkin_date',
                'checkout_date',
                'check_status',
                'actual_check_in',
                'actual_check_out',
            ]));

            return response()->json($booking, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update booking: ' . $e->getMessage()], 500);
        }
    }
}