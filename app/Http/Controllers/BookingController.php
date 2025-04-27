<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;

class BookingController extends Controller
{
    public function booking(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'phone' => 'required|string|max:15',
                'room_type' => 'required|string',
                'number_of_rooms' => 'required|integer|min:1',
                'children' => 'required|integer|min:0',
                'member' => 'required|integer|min:1',
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after:checkin_date',
            ]);

            $booking = Booking::create($validatedData);

            return response()->json([
                'message' => 'Booking created successfully!',
                'booking' => $booking,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Booking Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create booking.'], 500);
        }
    }

    public function getUserBookings($id)
    {
        // Lấy danh sách booking của user dựa trên user_id
        $bookings = Booking::where('user_id', $id)->get();

        // Nếu không có booking, trả về danh sách rỗng
        if ($bookings->isEmpty()) {
            return response()->json(['message' => 'No bookings found', 'bookings' => []], 200);
        }

        // Trả về danh sách booking
        return response()->json(['bookings' => $bookings], 200);
    }
    
}