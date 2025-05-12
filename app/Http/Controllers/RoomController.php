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
                'capacity' => $roomType->capacity,
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

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads'), $filename);
            $roomType->image = $filename;
        }

        $updated = $roomType->save();

        Log::info('Cập nhật room type:', [
            'id' => $id,
            'updated' => $updated,
            'data' => $roomType->toArray(),
        ]);

        return response()->json([
            'message' => 'Room type updated successfully',
            'data' => $roomType
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
        $room->image = $path;
    }

    $room->save();

    return response()->json(['message' => 'Thêm loại phòng thành công']);
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
