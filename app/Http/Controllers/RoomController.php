<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;

class RoomController extends Controller
{
    public function index()
    {
        // Lấy tất cả các loại phòng
        $roomTypes = RoomType::all();

        // Trả về dữ liệu dưới dạng JSON
        return response()->json($roomTypes);
    }

    public function update(Request $request, $id)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'capacity' => 'required|integer',
        'price' => 'required|numeric',
        'description' => 'nullable|string',
    ]);

    $room = RoomType::findOrFail($id);
    $room->update($validatedData);

    return response()->json(['message' => 'Cập nhật thành công']);
}


}
