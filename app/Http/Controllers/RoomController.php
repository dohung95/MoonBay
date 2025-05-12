<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class RoomController extends Controller
{

    public function index()
    {
        $roomTypes = RoomType::all();

        $roomTypes = $roomTypes->map(function ($roomType) {
            // Kiểm tra nếu phòng có hình ảnh
            if ($roomType->image) {
                $roomType->image_url = asset('storage/' . $roomType->image);
            } else {
                $roomType->image_url = null;
            }

            return $roomType;
        });

        return response()->json($roomTypes);
    }


    public function show()
    {
        $roomTypes = RoomType::all()->map(function ($roomType) {
            return [
                'id' => $roomType->id,
                'name' => $roomType->name,
                'price' => $roomType->price,
            ];
        });

        return response()->json(['room_types' => $roomTypes], 200);
    }

    public function update(Request $request, $id)
    {
        try {
            $roomType = RoomType::findOrFail($id);

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'capacity' => 'sometimes|integer',
                'price' => 'sometimes|numeric',
                'description' => 'sometimes|string',
                'image' => 'sometimes|file|image|max:2048'
            ]);

            Log::info('Dữ liệu nhận từ request:', $request->all());

            $roomType->fill($request->except('image'));

            if ($roomType->image && Storage::disk('public')->exists("room_types_huy/" . $roomType->image)) {
                Log::info('Ảnh tồn tại, chuẩn bị xóa:', ['file' => "room_types_huy/" . $roomType->image]);
                Storage::disk('public')->delete("room_types_huy/" . $roomType->image);
            } else {
                Log::error('Không tìm thấy ảnh cần xóa:', ['file' => "room_types_huy/" . $roomType->image]);
            }
            

            $oldImagePath = $roomType->image ? "room_types_huy/" . basename($roomType->image) : null;

            if ($request->hasFile('image')) {
                // Xóa ảnh cũ đúng cách
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Log::info('Ảnh tồn tại, chuẩn bị xóa:', ['file' => $oldImagePath]);
                    Storage::disk('public')->delete($oldImagePath);
                } else {
                    Log::error('Không tìm thấy ảnh cần xóa:', ['file' => $oldImagePath]);
                }

                // Lưu ảnh mới
                $filename = time() . '_' . $request->file('image')->getClientOriginalName();
                $request->file('image')->storeAs('room_types_huy', $filename, 'public');
                $roomType->image = "room_types_huy/" . $filename;
            }




            $updated = $roomType->save();

            Log::info('Cập nhật room type:', [
                'id' => $id,
                'updated' => $updated,
                'data' => $roomType->toArray(),
            ]);

            $imageUrl = $roomType->image ? asset("storage/" . $roomType->image) : null;

            return response()->json([
                'message' => 'Room type updated successfully',
                'data' => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                    'image' => $imageUrl
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật phòng:', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $room = new RoomType();
        $room->name = $validatedData['name'];
        $room->capacity = $validatedData['capacity'];
        $room->price = $validatedData['price'];
        $room->description = $validatedData['description'] ?? null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = $file->getClientOriginalExtension();
            $imageName = 'room_' . time() . '_' . uniqid() . '.' . $extension;

            $directory = 'room_types_huy';
            Storage::disk('public')->makeDirectory($directory);

            $path = $file->storeAs($directory, $imageName, 'public');
            $room->image = "room_types_huy/" . $imageName;
        }

        $room->save();

        $imageUrl = $room->image ? asset("storage/" . $room->image) : null;

        return response()->json([
            'message' => 'Thêm loại phòng thành công',
            'data' => [
                'id' => $room->id,
                'name' => $room->name,
                'image' => $imageUrl
            ]
        ]);
    }

    public function destroy(RoomType $room_type)
    {
        if ($room_type->image && Storage::disk('public')->exists($room_type->image)) {
            Storage::disk('public')->delete($room_type->image);
        }

        $room_type->delete();

        return response()->json(['message' => 'Xóa thành công.'], 204);
    }
}
