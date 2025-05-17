<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;

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
                'price' => 'required|numeric',
                'total_price' => 'required|numeric',
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date',
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

    public function destroy(Request $request, $id)
    {
        // Lấy token từ header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Tìm user dựa trên remember_token
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            Log::warning('Invalid token', ['token' => $token]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $booking = Booking::findOrFail($id);

        // Kiểm tra user có quyền hủy booking này không
        if ($booking->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Lấy thời gian check-in và thời gian hiện tại
        $checkinDate = Carbon::parse($booking->checkin_date);
        $now = Carbon::now();

        // Kiểm tra nếu đã tới hoặc qua thời gian check-in
        if ($now >= $checkinDate) {
            return response()->json(['message' => 'Cannot cancel booking. Check-in time has passed or is due.'], 422);
        }

        // Hủy booking
        $booking->delete();

        return response()->json(['message' => 'Booking cancelled successfully'], 200);
    }

    public function bookingList(Request $request)
{
    try {
        $perPage = $request->input('per_page', 30);
        $page = $request->input('page', 1);
        $search = $request->input('search');

        $query = Booking::select('id', 'name', 'email', 'phone', 'room_type', 'number_of_rooms', 'children', 'member', 'checkin_date', 'checkout_date', 'total_price', 'created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('room_type', 'like', "%{$search}%");
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $bookings->items(),
            'current_page' => $bookings->currentPage(),
            'last_page' => $bookings->lastPage(),
            'per_page' => $bookings->perPage(),
            'total' => $bookings->total(),
        ], 200);
    } catch (\Exception $e) {
        \Log::error('Lỗi khi lấy danh sách đặt phòng: ' . $e->getMessage());
        return response()->json([
            'message' => 'Lỗi khi lấy danh sách đặt phòng',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function booking_by_staff (Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name' => 'required|string|max:255',
                'email' => 'required|string',
                'phone' => 'required|string|max:15',
                'room_type' => 'required|string',
                'number_of_rooms' => 'required|integer|min:1',
                'children' => 'required|integer|min:0',
                'member' => 'required|integer|min:1',
                'price' => 'required|numeric',
                'total_price' => 'required|numeric',
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date',
            ]);

            $validatedData['price'] = $validatedData['price'] / 1000;
            $validatedData['total_price'] = $validatedData['total_price'] / 1000;

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

}