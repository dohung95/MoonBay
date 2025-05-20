<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StaffCustomerNote;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StaffCustomerManagementController extends Controller
{
    /**
     * Constructor với middleware auth
     */
    public function __construct()
    {
        // Không cần middleware ở đây nếu đã có trong routes/api.php
         $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of the resource.
     * Cho phép tìm kiếm khách hàng theo tên, số điện thoại, email.
     */
    public function index(Request $request)
    {
        \Log::info('Bắt đầu lấy danh sách khách hàng', [
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'params' => $request->all()
        ]);

        $query = User::query();

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->input('email') . '%');
        }

        if ($request->has('phone')) {
            $query->where('phone', 'like', '%' . $request->input('phone') . '%');
        }
        if ($request->has('customer_status')) {
            $query->where('customer_status', 'like', '%'. $request->input('customer_status'). '%');
        }
        $query->where('role', 'user');

        $customers = $query->get();

        \Log::info('Lấy danh sách khách hàng thành công', [
            'count' => $customers->count()
        ]);

        return response()->json($customers, Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     * Hiển thị lịch sử lưu trú, các ghi chú đặc biệt nổi bật.
     */
    public function show($id)
{
    try {
        // Tìm khách hàng theo ID
        $customer = User::findOrFail($id);
        
        // Lấy lịch sử lưu trú một cách an toàn
        try {
            $stayHistory = $customer->stayHistory()->get();
        } catch (\Exception $e) {
            \Log::warning('Không thể lấy lịch sử lưu trú: ' . $e->getMessage());
            $stayHistory = [];
        }
        
        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'customer_status' => $customer->customer_status,
            'special_notes' => $customer->special_notes,
            'stay_history' => $stayHistory,
            'created_at' => $customer->created_at,
            'updated_at' => $customer->updated_at,
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error fetching customer details', 'error' => $e->getMessage()], 500);
    }
}

    /**
     * Update the special notes for the specified resource in storage.
     * Cho phép cập nhật ghi chú ngay trên trang chi tiết khách hàng.
     */
    public function updateNotes(Request $request, $id)
    {
        $request->validate([
            'special_notes' => 'nullable|string|max:1000',
            'customer_status' => 'nullable|string|max:50',
        ]);

        try {
            \Log::info("Bắt đầu cập nhật ghi chú cho khách hàng ID: {$id}", [
                'customer_status' => $request->input('customer_status')
            ]);
            $customer = User::findOrFail($id);
            $customer->special_notes = $request->input('special_notes');
            if ($request->has('customer_status')) {
                $customer->customer_status = $request->input('customer_status');
            }
            $customer->save();

            \Log::info("Cập nhật ghi chú thành công cho khách hàng ID: {$id}");

            return response()->json([
                'message' => 'Customer notes updated successfully.',
                'customer' => $customer,
            ], Response::HTTP_OK);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error("Không tìm thấy khách hàng ID: {$id}");
            return response()->json(['message' => 'Customer not found'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            \Log::error("Lỗi khi cập nhật ghi chú cho khách hàng ID: {$id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error updating customer notes', 'error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created customer note in storage.
     * Chức năng được chuyển từ StaffCustomerNoteController
     */
    public function store(Request $request)
    {
        \Log::info('Bắt đầu lưu ghi chú khách hàng', $request->all());
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'note' => 'required|string',
            'customer_status' => 'required|string|in:regular,vip,special',
        ]);

        try {
            $note = new StaffCustomerNote();
            $note->user_id = $request->user_id;
            $note->staff_id = $request->user()->id;
            $note->note = $request->note;
            $note->customer_status = $request->customer_status;
            \Log::info('Trước khi lưu CustomerNote', $note->toArray());
            $note->save();
            \Log::info('Đã lưu CustomerNote thành công', ['id' => $note->id]);

            $customer = User::find($request->user_id);
            if ($customer) {
                $customer->customer_status = $request->customer_status;
                $customer->save();
                \Log::info('Đã cập nhật trạng thái khách hàng', [
                    'user_id' => $customer->id,
                    'customer_status' => $customer->customer_status
                ]);
            }

            return response()->json([
                'message' => 'Ghi chú khách hàng đã được lưu thành công.',
                'note' => $note,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            \Log::error('Lỗi khi lưu ghi chú khách hàng', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu ghi chú khách hàng.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
//  public function store(Request $request)
//     {
//         \Log::info('Bắt đầu lưu ghi chú khách hàng', $request->all());
//         $request->validate([
//             'user_id' => 'required|exists:users,id',
//             'note' => 'required|string',
//             'customer_status' => 'required|string|in:regular,vip,special',
//         ]);

//         try {
//             $note = new StaffCustomerNote();
//             $note->user_id = $request->user_id;
//             $note->staff_id = Auth()->id(); // hoặc id();
//             $note->note = $request->note;
//             $note->customer_status = $request->customer_status;
//             \Log::info('Trước khi lưu CustomerNote', $note->toArray());
//             $note->save();
//             \Log::info('Đã lưu CustomerNote thành công', ['id' => $note->id]);

//             $user = User::find($request->user_id);
//             if (!$user) {
//                 \Log::error('Không tìm thấy user', ['user_id' => $request->user_id]);
//                 return response()->json(['message' => 'User not found'], 404);
//             }
//             $user->special_notes = $request->note;
//             $user->customer_status = $request->customer_status;
//             $user->save();
//             \Log::info('Đã cập nhật user thành công', ['user_id' => $user->id]);

//             return response()->json(['message' => 'Ghi chú và trạng thái khách hàng đã được lưu thành công!']);
//         } catch (\Exception $e) {
//             \Log::error('Lỗi khi lưu ghi chú khách hàng', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
//             return response()->json([
//                 'message' => 'Có lỗi khi lưu ghi chú khách hàng',
//                 'error' => $e->getMessage()
//             ], 500);
//         }
//     }