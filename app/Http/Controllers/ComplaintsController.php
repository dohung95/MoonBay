<?php

namespace App\Http\Controllers;

use App\Models\Complaints;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class ComplaintsController extends Controller
{
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string',
        'customer_email' => 'required|email',
        'customer_phone' => 'nullable|string',
        'complaint_type' => 'required|string',
        'description' => 'required|string',
        'contact_preference' => 'required|in:Yes,No',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    $complaint = Complaints::create($request->all());

    return response()->json(['message' => 'Gửi khiếu nại thành công', 'complaint' => $complaint], 201);
}

public function getStaffList()
{
    $staffs = User::where('role', 'staff')->get(['id', 'name']);
    return response()->json($staffs);
}

public function indexAdmin()
{
    $complaints = Complaints::orderByRaw("
        CASE status
            WHEN 'pending' THEN 1
            WHEN 'resolved' THEN 2
            WHEN 'rejected' THEN 3
            ELSE 4
        END ASC,
        created_at ASC
    ")->paginate(5);

    return response()->json($complaints);
}


public function update(Request $request, $id)
{
    $complaint = Complaints::findOrFail($id);

    $data = $request->only(['status', 'handler_name']);
    $complaint->update($data);

    return response()->json(['message' => 'Cập nhật thành công', 'complaint' => $complaint]);
}

public function destroy($id)
{
    $complaint = Complaints::find($id);
    if (!$complaint) {
        return response()->json(['message' => 'Không tìm thấy khiếu nại'], 404);
    }

    $complaint->delete();

    return response()->json(['message' => 'Xóa khiếu nại thành công']);
}


}
