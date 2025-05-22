<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\Booking_email_successfully;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;


class Booking_email_successfullyController extends Controller
{
    public function sendEmail(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'to' => 'required|email',
            'user_name' => 'required|string',
            'room_type' => 'required|string',
            'number_of_rooms' => 'required|integer|min:1',
            'checkin_date' => 'required|date',
            'checkout_date' => 'required|date|after:checkin_date',
            'total_price' => 'required|string',
            'deposit_paid' => 'required|string',
            'remaining_amount' => 'required|string',
            'payment_status' => 'required|string',
            'member' => 'required|integer|min:1',
            'children' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $bookingData = [
                'user_name' => $request->user_name,
                'room_type' => $request->room_type,
                'number_of_rooms' => $request->number_of_rooms,
                'checkin_date' => $request->checkin_date,
                'checkout_date' => $request->checkout_date,
                'total_price' => $request->total_price,
                'deposit_paid' => $request->deposit_paid,
                'remaining_amount' => $request->remaining_amount,
                'payment_status' => $request->payment_status,
                'member' => $request->member,
                'children' => $request->children,
            ];

            Mail::to($request->to)->send(new Booking_email_successfully($bookingData));

            return response()->json(['message' => 'Booking confirmation email sent successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error sending email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}