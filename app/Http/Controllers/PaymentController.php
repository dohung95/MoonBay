<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        // ✅ Lấy user từ middleware (RememberTokenAuth đã gọi Auth::login($user))
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // ✅ Validate dữ liệu đầu vào
        $validated = $request->validate([
            'amount' => 'required|integer|min:1000',
            'method' => 'required|string',
            'bank_account_receiver' => 'nullable|string',
            'payment_info' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        // ✅ Lưu giao dịch vào bảng payments
        $payment = Payment::create([
            'user_id' => $user->id,
            'method' => $validated['method'],
            'amount' => $validated['amount'],
            'bank_account_receiver' => $validated['bank_account_receiver'] ?? null,
            'payment_info' => $validated['payment_info'] ?? null,
            'status' => $validated['status'] ?? 'paid'
        ]);

        return response()->json([
            'message' => 'Payment saved successfully.',
            'payment' => $payment,
        ], 201);
    }
}
