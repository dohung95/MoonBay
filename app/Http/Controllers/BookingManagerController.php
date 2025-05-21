<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;


class BookingManagerController extends Controller
{
    public function index()
    {
        $bookings = BookingManager::all();
        return response()->json($bookings);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'checkin_date' => 'required|date',
            'checkout_date' => 'required|date|after_or_equal:checkin_date',
        ]);

        $booking = BookingManager::findOrFail($id);
        $booking->checkin_date = $request->input('checkin_date');
        $booking->checkout_date = $request->input('checkout_date');
        $booking->save();

        return response()->json($booking);
    }
}
