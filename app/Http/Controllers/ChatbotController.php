<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use App\Models\Booking;
use App\Models\RoomInfo;
use App\Models\SpecialOffer;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private function callDeepSeekApi($prompt)
    {
        $apiKey = env('OPENROUTER_API_KEY');
        if (!$apiKey) {
            return ['error' => 'Lỗi: API key OpenRouter không được cấu hình.'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer $apiKey",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://moonbayhotel.com',
                'X-Title' => 'MoonBay Chatbot',
            ])->withOptions([
                'verify' => false,
                'timeout' => 90,
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'deepseek/deepseek-chat-v3-0324:free',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Bạn là trợ lý khách sạn MoonBay. Phân tích câu hỏi của người dùng bằng tiếng Việt và CHỈ trả về một JSON hợp lệ có cấu trúc như sau:
                        {
                            "intent": "lowest_price_room | highest_price_room | mid_tier_room | most_premium_room | room_recommendation | room_types | room_prices | room_capacity | offers | available_rooms | book_room | checkin_policy | cancel_policy | peak_season | off_peak_season | specific_room_info | most_booked_room | least_booked_room | room_price_range | non_hotel",
                            "params": {
                                "people_count": số_người (nếu có, dùng cho gợi ý phòng),
                                "start_date": "YYYY-MM-DD" (nếu có, dùng cho phòng trống),
                                "end_date": "YYYY-MM-DD" (nếu có, dùng cho phòng trống),
                                "room_type": "tên loại phòng" (nếu có, dùng cho thông tin phòng cụ thể),
                                "time_granularity": "day | month | year" (nếu có, dùng cho phòng được đặt nhiều/ít nhất),
                                "specific_date": "YYYY-MM-DD" (nếu có, ngày cụ thể cho time_granularity = day),
                                "specific_month": "YYYY-MM" (nếu có, tháng cụ thể cho time_granularity = month),
                                "specific_year": "YYYY" (nếu có, năm cụ thể cho time_granularity = year),
                                "min_price": số_tiền (nếu có, dùng cho khoảng giá phòng),
                                "max_price": số_tiền (nếu có, dùng cho khoảng giá phòng)
                            },
                            "response": "Câu trả lời bằng ngôn ngữ tự nhiên nếu intent là non_hotel"
                        }
                        - Nếu câu hỏi liên quan đến thông tin khách sạn (giá phòng, loại phòng, phòng trống, ưu đãi, đặt phòng, chính sách, mùa cao điểm, mùa thấp điểm, thông tin phòng cụ thể, phòng được đặt nhiều/ít nhất, phòng hạng trung, khoảng giá phòng, v.v.), xác định intent và params thích hợp.
                        - Nếu câu hỏi không liên quan đến khách sạn, đặt intent là "non_hotel" và trả lời bằng ngôn ngữ tự nhiên trong "response".
                        - Ví dụ:
                          - Câu hỏi: "Phòng nào rẻ nhất?" -> {"intent": "lowest_price_room", "params": {}}
                          - Câu hỏi: "Phòng đắt nhất là gì?" -> {"intent": "highest_price_room", "params": {}}
                          - Câu hỏi: "Phòng hạng trung là gì?" -> {"intent": "mid_tier_room", "params": {}}
                          - Câu hỏi: "Phòng cao cấp nhất/xinh nhất/đẹp nhất/sang nhất/xịn nhất là gì?" -> {"intent": "most_premium_room", "params": {}}
                          - Câu hỏi: "Phòng Family giá bao nhiêu?" -> {"intent": "specific_room_info", "params": {"room_type": "Family"}}
                          - Câu hỏi: "Tôi đi 4 người thì nên ở phòng nào?" -> {"intent": "room_recommendation", "params": {"people_count": 4}}
                          - Câu hỏi: "Có phòng trống từ 25/05/2025 đến 27/05/2025 không?" -> {"intent": "available_rooms", "params": {"start_date": "2025-05-25", "end_date": "2025-05-27"}}
                          - Câu hỏi: "Tôi muốn đặt phòng" -> {"intent": "book_room", "params": {}}
                          - Câu hỏi: "Giờ nhận phòng là khi nào?" -> {"intent": "checkin_policy", "params": {}}
                          - Câu hỏi: "Chính sách hủy phòng thế nào?" -> {"intent": "cancel_policy", "params": {}}
                          - Câu hỏi: "Mùa nào là cao điểm nhất?" -> {"intent": "peak_season", "params": {}}
                          - Câu hỏi: "Mùa nào là thấp điểm nhất?" -> {"intent": "off_peak_season", "params": {}}
                          - Câu hỏi: "Phòng nào được đặt nhiều nhất trong tháng 5/2025?" -> {"intent": "most_booked_room", "params": {"time_granularity": "month", "specific_month": "2025-05"}}
                          - Câu hỏi: "Phòng nào được đặt ít nhất trong năm 2025?" -> {"intent": "least_booked_room", "params": {"time_granularity": "year", "specific_year": "2025"}}
                          - Câu hỏi: "Phòng nào được đặt nhiều nhất hôm nay?" -> {"intent": "most_booked_room", "params": {"time_granularity": "day", "specific_date": "hôm nay"}}
                          - Câu hỏi: "Tìm phòng giá từ 400 đến 600" -> {"intent": "room_price_range", "params": {"min_price": 400000, "max_price": 600000}}
                          - Câu hỏi: "Thời tiết ở Đà Nẵng thế nào?" -> {"intent": "non_hotel", "params": {}, "response": "Thời tiết ở Đà Nẵng hôm nay..."}
                        - CHỈ trả về JSON hợp lệ, không thêm bất kỳ văn bản nào ngoài JSON (không giải thích, không chú thích).'
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'stream' => false,
            ])->json();

            Log::info('DeepSeek API Raw Response for prompt: ' . $prompt, $response);

            if (isset($response['error'])) {
                Log::error('OpenRouter API Error: ' . $response['error']['message']);
                return ['error' => 'OpenRouter API trả về lỗi: ' . $response['error']['message']];
            }

            if (!isset($response['choices']) || empty($response['choices'])) {
                Log::warning('No choices in OpenRouter API response');
                return ['error' => 'Không nhận được phản hồi từ OpenRouter AI.'];
            }

            $content = $response['choices'][0]['message']['content'] ?? '{}';
            Log::info('Raw content before processing: ' . $content);
            $content = preg_replace('/^```json\n|\n```$/', '', trim($content));
            Log::info('Raw content after cleaning: ' . $content);
            $decoded = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON decode error: ' . json_last_error_msg() . ', Raw content: ' . $content);
                return ['error' => 'Lỗi khi phân tích phản hồi từ OpenRouter AI: ' . json_last_error_msg()];
            }
            Log::info('Decoded intent: ' . json_encode($decoded));
            return $decoded;
        } catch (\Exception $e) {
            Log::error('OpenRouter API Exception: ' . $e->getMessage());
            return ['error' => 'Đã xảy ra lỗi khi kết nối với OpenRouter AI: ' . $e->getMessage()];
        }
    }

    private function getRoomsInPriceRange($minPrice, $maxPrice)
    {
        $rooms = DB::table('room_types')
                   ->select('name', 'price')
                   ->whereBetween('price', [$minPrice, $maxPrice])
                   ->orderBy('price', 'asc')
                   ->get();

        if ($rooms->isEmpty()) {
            Log::warning('No rooms found in price range: ' . $minPrice . ' to ' . $maxPrice);
            return "Không có phòng nào trong khoảng giá từ " . number_format($minPrice, 0, ',', '.') . " đến " . number_format($maxPrice, 0, ',', '.') . " VNĐ/đêm.";
        }

        $response = "";
        foreach ($rooms as $room) {
            $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
        }
        return $response;
    }

    public function handle(Request $request)
    {
        $userInput = $request->input('prompt');
        if (!$userInput) {
            return response()->json(['error' => 'Missing prompt'], 400);
        }

        // Fallback regex cho các câu hỏi về phòng và mùa
        $normalizedInput = strtolower($userInput);
        if (preg_match('/\b(phong xinh nhất|phong xịn nhất|phong đẹp nhất|phong sang nhất|phong cao cấp nhất)\b/', $normalizedInput)) {
            $room = DB::table('room_types')
                       ->where('name', 'LIKE', '%Suite%')
                       ->select('name', 'price')
                       ->first();
            if (!$room) {
                $room = DB::table('room_types')
                           ->select('name', 'price')
                           ->orderBy('price', 'desc')
                           ->first();
                if (!$room) {
                    Log::warning('No rooms found for most premium room');
                    return response()->json(['response' => 'Hiện tại không có phòng cao cấp trong hệ thống.']);
                }
            }
            $response = "Phòng xinh/xịn nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho câu hỏi về phòng cụ thể
        if (preg_match('/\bphong\s+([a-zA-Z\s]+)\s*(gia bao nhieu|giá bao nhiêu|co gia bao nhieu|có giá bao nhiêu)\b/', $normalizedInput, $matches)) {
            $roomType = trim($matches[1]);
            $room = DB::table('room_types')
                       ->where('name', 'LIKE', '%' . $roomType . '%')
                       ->select('name', 'price', 'capacity')
                       ->first();
            if (!$room) {
                Log::warning('No room found for type: ' . $roomType);
                return response()->json(['response' => "Không tìm thấy thông tin về phòng {$roomType} trong hệ thống."]);
            }
            $response = "Phòng {$room->name} có giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm và sức chứa {$room->capacity} người.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho mùa cao điểm và thấp điểm
        if (preg_match('/\b(mua cao diem nhat|mùa cao điểm nhất)\b/', $normalizedInput)) {
            $peakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                                 ->groupBy('month')
                                 ->orderBy('booking_count', 'desc')
                                 ->first();
            if (!$peakSeason) {
                Log::warning('No bookings found for peak season');
                return response()->json(['response' => 'Hiện tại không có thông tin về mùa cao điểm trong hệ thống.']);
            }
            $monthName = Carbon::createFromFormat('m', $peakSeason->month)->locale('vi')->monthName;
            $response = "Mùa cao điểm nhất là tháng {$monthName} với số lượng đặt phòng cao nhất.";
            return response()->json(['response' => $response]);
        }

        if (preg_match('/\b(mua thap diem nhat|mùa thấp điểm nhất)\b/', $normalizedInput)) {
            $offPeakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                                    ->groupBy('month')
                                    ->orderBy('booking_count', 'asc')
                                    ->first();
            if (!$offPeakSeason) {
                Log::warning('No bookings found for off-peak season');
                return response()->json(['response' => 'Hiện tại không có thông tin về mùa thấp điểm trong hệ thống.']);
            }
            $monthName = Carbon::createFromFormat('m', $offPeakSeason->month)->locale('vi')->monthName;
            $response = "Mùa thấp điểm nhất là tháng {$monthName} với số lượng đặt phòng thấp nhất.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho câu hỏi về khoảng giá phòng
        if (preg_match('/\b(tim phòng|tìm phòng|phong|phòng)\s*(gia|giá)?\s*tu\s*(\d+\.?\d{0,3})\s*(?:ngan|ngàn|k)?\s*(?:den|đến)\s*(\d+\.?\d{0,3})\s*(?:ngan|ngàn|k)?\b/', $normalizedInput, $matches)) {
            $minPrice = (float)str_replace('.', '', $matches[3]) * 1000;
            $maxPrice = (float)str_replace('.', '', $matches[4]) * 1000;
            $response = "Các phòng trong khoảng giá từ " . number_format($minPrice, 0, ',', '.') . " đến " . number_format($maxPrice, 0, ',', '.') . " VNĐ/đêm:\n\n" . $this->getRoomsInPriceRange($minPrice, $maxPrice);
            return response()->json(['response' => $response]);
        }

        // Gọi DeepSeek API để phân tích ý định
        $apiResponse = $this->callDeepSeekApi($userInput);

        if (isset($apiResponse['error'])) {
            Log::error('API Response Error: ' . $apiResponse['error']);
            // Fallback đến regex nếu DeepSeek thất bại
            if (preg_match('/\b(phong xinh nhất|phong xịn nhất|phong đẹp nhất|phong sang nhất|phong cao cấp nhất|phong rẻ nhất|phong re nhất|phong đắt nhất|phong dat nhất)\b/', $normalizedInput)) {
                $room = DB::table('room_types')
                           ->where('name', 'LIKE', '%Suite%')
                           ->select('name', 'price')
                           ->first();
                if (!$room) {
                    $room = DB::table('room_types')
                               ->select('name', 'price')
                               ->orderBy('price', 'desc')
                               ->first();
                    if (!$room) {
                        Log::warning('No rooms found for most premium room');
                        return response()->json(['response' => 'Hiện tại không có phòng cao cấp trong hệ thống.']);
                    }
                }
                $response = "Phòng xinh/xịn nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                return response()->json(['response' => $response]);
            }
            return response()->json(['response' => $apiResponse['error']]);
        }

        $intent = $apiResponse['intent'] ?? 'non_hotel';
        $params = $apiResponse['params'] ?? [];

        try {
            switch ($intent) {
                case 'lowest_price_room':
                    $room = DB::table('room_types')
                               ->select('name', 'price')
                               ->orderBy('price', 'asc')
                               ->first();
                    Log::info('Lowest price room query result:', ['room' => $room]);
                    if (!$room) {
                        Log::warning('No rooms found in room_types table for lowest_price_room');
                        return response()->json(['response' => 'Hiện tại không có thông tin về phòng trong hệ thống.']);
                    }
                    $response = "Phòng có giá rẻ nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'highest_price_room':
                    $room = DB::table('room_types')
                               ->select('name', 'price')
                               ->orderBy('price', 'desc')
                               ->first();
                    Log::info('Highest price room query result:', ['room' => $room]);
                    if (!$room) {
                        Log::warning('No rooms found in room_types table for highest_price_room');
                        return response()->json(['response' => 'Hiện tại không có thông tin về phòng trong hệ thống.']);
                    }
                    $response = "Phòng có giá cao nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'mid_tier_room':
                    $rooms = DB::table('room_types')
                               ->select('name', 'price')
                               ->orderBy('price', 'asc')
                               ->get();
                    Log::info('Mid-tier room query result:', ['rooms' => $rooms]);
                    if ($rooms->count() < 3) {
                        Log::warning('Not enough rooms found for mid-tier room query');
                        return response()->json(['response' => 'Hiện tại không có đủ thông tin về phòng để xác định phòng hạng trung.']);
                    }
                    $midTierRooms = $rooms->slice(1, $rooms->count() - 2);
                    if ($midTierRooms->isEmpty()) {
                        Log::warning('No mid-tier rooms after excluding highest and lowest priced rooms');
                        return response()->json(['response' => 'Không có phòng hạng trung trong hệ thống.']);
                    }
                    $response = "Các phòng hạng trung hiện có:\n";
                    foreach ($midTierRooms as $room) {
                        $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    return response()->json(['response' => $response]);

                case 'most_premium_room':
                    $room = DB::table('room_types')
                               ->where('name', 'LIKE', '%Suite%')
                               ->select('name', 'price')
                               ->first();
                    Log::info('Most premium room query result:', ['room' => $room]);
                    if (!$room) {
                        $room = DB::table('room_types')
                                   ->select('name', 'price')
                                   ->orderBy('price', 'desc')
                                   ->first();
                        if (!$room) {
                            Log::warning('No rooms found in room_types table for most_premium_room');
                            return response()->json(['response' => 'Hiện tại không có phòng cao cấp trong hệ thống.']);
                        }
                    }
                    $response = "Phòng cao cấp/xịn nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'specific_room_info':
                    $roomType = $params['room_type'] ?? null;
                    if (!$roomType) {
                        return response()->json(['response' => 'Vui lòng cung cấp tên loại phòng để tôi có thể cung cấp thông tin.']);
                    }
                    $room = DB::table('room_types')
                               ->where('name', 'LIKE', '%' . $roomType . '%')
                               ->select('name', 'price', 'capacity')
                               ->first();
                    Log::info('Specific room info query result:', ['room_type' => $roomType, 'room' => $room]);
                    if (!$room) {
                        Log::warning('No room found for type: ' . $roomType);
                        return response()->json(['response' => "Không tìm thấy thông tin về phòng {$roomType} trong hệ thống."]);
                    }
                    $response = "Phòng {$room->name} có giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm và sức chứa {$room->capacity} người.";
                    return response()->json(['response' => $response]);

                case 'room_recommendation':
                    $peopleCount = $params['people_count'] ?? null;
                    if (!$peopleCount || !is_numeric($peopleCount) || $peopleCount <= 0) {
                        return response()->json(['response' => 'Vui lòng cung cấp số người để tôi có thể gợi ý phòng phù hợp.']);
                    }
                    $rooms = DB::table('room_types')
                               ->select('name', 'price', 'capacity')
                               ->where('capacity', '>=', $peopleCount)
                               ->orderBy('capacity', 'asc')
                               ->orderBy('price', 'asc')
                               ->get();
                    Log::info('Room recommendation query result:', ['people_count' => $peopleCount, 'rooms' => $rooms]);
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for people count: ' . $peopleCount);
                        return response()->json(['response' => "Không có phòng phù hợp cho {$peopleCount} người trong hệ thống."]);
                    }
                    $response = "Dựa trên {$peopleCount} người, tôi gợi ý các phòng sau:\n\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: Sức chứa {$room->capacity} người, giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    $response .= "\nBạn có muốn đặt phòng? [Đặt ngay](/booking#booknow)";
                    return response()->json(['response' => $response]);

                case 'room_types':
                    $roomTypes = DB::table('room_types')->pluck('name')->toArray();
                    Log::info('Room types query result:', ['room_types' => $roomTypes]);
                    if (empty($roomTypes)) {
                        Log::warning('No room types found');
                        return response()->json(['response' => 'Không tìm thấy loại phòng nào trong hệ thống.']);
                    }
                    return response()->json(['response' => 'Các loại phòng hiện có: ' . implode(', ', $roomTypes) . '.']);

                case 'room_prices':
                    $rooms = DB::table('room_types')->select('name', 'price')->get();
                    Log::info('Room prices query result:', ['rooms' => $rooms]);
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for room_prices');
                        return response()->json(['response' => 'Không tìm thấy thông tin phòng trong hệ thống.']);
                    }
                    $response = "Giá các loại phòng:\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    return response()->json(['response' => $response]);

                case 'room_capacity':
                    $rooms = DB::table('room_types')->select('name', 'capacity')->get();
                    Log::info('Room capacity query result:', ['rooms' => $rooms]);
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for room_capacity');
                        return response()->json(['response' => 'Không tìm thấy thông tin phòng trong hệ thống.']);
                    }
                    $response = "Sức chứa các loại phòng:\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: {$room->capacity} người\n";
                    }
                    return response()->json(['response' => $response]);

                case 'offers':
                    $today = Carbon::today();
                    $offers = SpecialOffer::where(function ($query) use ($today) {
                        $query->where(function ($q) use ($today) {
                            $q->where('season_start', '<=', $today)
                              ->where('season_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('discount_start', '<=', $today)
                              ->where('discount_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('gift_start', '<=', $today)
                              ->where('gift_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('other_offer_start', '<=', $today)
                              ->where('other_offer_end', '>=', $today);
                        });
                    })->get();
                    Log::info('Offers query result:', ['offers' => $offers]);
                    if ($offers->isEmpty()) {
                        Log::warning('No offers found');
                        return response()->json(['response' => 'Hiện tại không có ưu đãi nào đang áp dụng.']);
                    }
                    $response = "Các ưu đãi hiện tại:\n\n";
                    foreach ($offers as $offer) {
                        if ($offer->season && $offer->season_start <= $today && $offer->season_end >= $today) {
                            $response .= "- Mùa: {$offer->season}\n";
                            if ($offer->free_services) {
                                $response .= "  Dịch vụ miễn phí: {$offer->free_services}\n";
                            }
                            $response .= "  Thời gian: {$offer->season_start->format('d/m/Y')} - {$offer->season_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->discount_percent && $offer->discount_start <= $today && $offer->discount_end >= $today) {
                            $response .= "- Chiết khấu: {$offer->discount_percent}% cho hóa đơn từ " . number_format($offer->total_bill_threshold, 0, ',', '.') . " VNĐ\n";
                            $response .= "  Thời gian: {$offer->discount_start->format('d/m/Y')} - {$offer->discount_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->gift_description && $offer->gift_start <= $today && $offer->gift_end >= $today) {
                            $response .= "- Quà tặng: {$offer->gift_description} khi ở {$offer->stay_duration_days} ngày\n";
                            $response .= "  Thời gian: {$offer->gift_start->format('d/m/Y')} - {$offer->gift_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->other_package_description && $offer->other_offer_start <= $today && $offer->other_offer_end >= $today) {
                            $response .= "- Gói ưu đãi khác: {$offer->other_package_description}\n";
                            $response .= "  Thời gian: {$offer->other_offer_start->format('d/m/Y')} - {$offer->other_offer_end->format('d/m/Y')}\n\n";
                        }
                    }
                    $response .= "Để tận dụng các ưu đãi, hãy đặt phòng ngay: [Đặt phòng ngay](/booking#booknow)";
                    return response()->json(['response' => $response]);

                case 'available_rooms':
                    $startDate = !empty($params['start_date']) ? Carbon::createFromFormat('Y-m-d', $params['start_date']) : null;
                    $endDate = !empty($params['end_date']) ? Carbon::createFromFormat('Y-m-d', $params['end_date']) : null;
                    if (!$startDate || !$endDate) {
                        return response()->json(['response' => 'Vui lòng cung cấp đầy đủ khoảng thời gian (VD: phòng trống từ 25/05/2025 đến 27/05/2025).']);
                    }
                    $bookedRoomIds = Booking::where(function ($query) use ($startDate, $endDate) {
                        $query->where('checkin_date', '<=', $endDate)
                              ->where('checkout_date', '>=', $startDate);
                    })->pluck('room_id');
                    $availableRooms = RoomInfo::whereNotIn('id', $bookedRoomIds)
                                             ->select('type', 'price')
                                             ->get();
                    Log::info('Available rooms query result:', ['start_date' => $startDate, 'end_date' => $endDate, 'rooms' => $availableRooms]);
                    if ($availableRooms->isEmpty()) {
                        return response()->json(['response' => 'Không có phòng trống trong khoảng thời gian từ ' . $startDate->format('d/m/Y') . ' đến ' . $endDate->format('d/m/Y') . '.']);
                    }
                    $roomSummary = $availableRooms->groupBy('type')->map(function ($rooms) {
                        return [
                            'count' => $rooms->count(),
                            'price' => $rooms->first()->price
                        ];
                    });
                    $response = "Phòng trống từ " . $startDate->format('d/m/Y') . " đến " . $endDate->format('d/m/Y') . ":\n\n";
                    foreach ($roomSummary as $type => $info) {
                        $response .= "Loại phòng {$type} còn {$info['count']} phòng trống, giá " . number_format($info['price'], 0, ',', '.') . " VNĐ/đêm\n\n";
                    }
                    return response()->json(['response' => $response]);

                case 'book_room':
                    $response = "Bạn muốn đặt phòng? Vui lòng nhấp vào liên kết sau để đặt phòng: [Đặt phòng ngay](/booking#booknow)";
                    return response()->json(['response' => $response]);

                case 'checkin_policy':
                    return response()->json(['response' => 'Giờ nhận phòng là 13:00 và giờ trả phòng là trước 12:00.']);

                case 'cancel_policy':
                    return response()->json(['response' => 'Bạn có thể hủy đặt phòng miễn phí trước 48 giờ so với ngày nhận phòng. Sau thời gian đó, bạn sẽ bị tính phí 100% giá trị đặt phòng.']);

                case 'peak_season':
                    $peakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                                         ->groupBy('month')
                                         ->orderBy('booking_count', 'desc')
                                         ->first();
                    Log::info('Peak season query result:', ['month' => $peakSeason]);
                    if (!$peakSeason) {
                        Log::warning('No bookings found for peak season');
                        return response()->json(['response' => 'Hiện tại không có thông tin về mùa cao điểm trong hệ thống.']);
                    }
                    $monthName = Carbon::createFromFormat('m', $peakSeason->month)->locale('vi')->monthName;
                    $response = "Mùa cao điểm nhất là tháng {$monthName} với số lượng đặt phòng cao nhất.";
                    return response()->json(['response' => $response]);

                case 'off_peak_season':
                    $offPeakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                                            ->groupBy('month')
                                            ->orderBy('booking_count', 'asc')
                                            ->first();
                    Log::info('Off-peak season query result:', ['month' => $offPeakSeason]);
                    if (!$offPeakSeason) {
                        Log::warning('No bookings found for off-peak season');
                        return response()->json(['response' => 'Hiện tại không có thông tin về mùa thấp điểm trong hệ thống.']);
                    }
                    $monthName = Carbon::createFromFormat('m', $offPeakSeason->month)->locale('vi')->monthName;
                    $response = "Mùa thấp điểm nhất là tháng {$monthName} với số lượng đặt phòng thấp nhất.";
                    return response()->json(['response' => $response]);

                case 'most_booked_room':
                    $timeGranularity = $params['time_granularity'] ?? null;
                    if (!$timeGranularity || !in_array($timeGranularity, ['day', 'month', 'year'])) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng thời gian hợp lệ (ngày, tháng, hoặc năm) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                    }

                    $query = Booking::select('room_type', DB::raw('COUNT(*) as booking_count'))
                                    ->groupBy('room_type')
                                    ->orderBy('booking_count', 'desc')
                                    ->orderBy('room_type', 'asc');

                    if ($timeGranularity === 'day') {
                        $specificDate = $params['specific_date'] ?? null;
                        if ($specificDate === 'hôm nay') {
                            $specificDate = Carbon::today()->format('Y-m-d');
                        }
                        if (!$specificDate) {
                            return response()->json(['response' => 'Vui lòng cung cấp ngày cụ thể (VD: hôm nay hoặc 25/05/2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $date = Carbon::createFromFormat('Y-m-d', $specificDate);
                        $query->whereDate('checkin_date', '<=', $date)
                              ->whereDate('checkout_date', '>=', $date);
                        $periodLabel = "ngày " . $date->format('d/m/Y');
                    } elseif ($timeGranularity === 'month') {
                        $specificMonth = $params['specific_month'] ?? null;
                        if (!$specificMonth) {
                            return response()->json(['response' => 'Vui lòng cung cấp tháng cụ thể (VD: 05/2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $monthStart = Carbon::createFromFormat('Y-m', $specificMonth)->startOfMonth();
                        $monthEnd = $monthStart->copy()->endOfMonth();
                        $query->where('checkin_date', '<=', $monthEnd)
                              ->where('checkout_date', '>=', $monthStart);
                        $monthName = $monthStart->locale('vi')->monthName;
                        $periodLabel = "tháng {$monthName} năm {$monthStart->year}";
                    } else {
                        $specificYear = $params['specific_year'] ?? null;
                        if (!$specificYear) {
                            return response()->json(['response' => 'Vui lòng cung cấp năm cụ thể (VD: 2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $yearStart = Carbon::createFromFormat('Y', $specificYear)->startOfYear();
                        $yearEnd = $yearStart->copy()->endOfYear();
                        $query->where('checkin_date', '<=', $yearEnd)
                              ->where('checkout_date', '>=', $yearStart);
                        $periodLabel = "năm {$specificYear}";
                    }

                    $mostBooked = $query->first();
                    Log::info('Most booked room query result:', ['time_granularity' => $timeGranularity, 'result' => $mostBooked]);
                    if (!$mostBooked) {
                        Log::warning('No bookings found for most booked room');
                        return response()->json(['response' => "Không có dữ liệu đặt phòng nào trong {$periodLabel}."]);
                    }
                    $response = "Phòng được đặt nhiều nhất trong {$periodLabel} là loại phòng {$mostBooked->room_type} với {$mostBooked->booking_count} lượt đặt.";
                    return response()->json(['response' => $response]);

                case 'least_booked_room':
                    $timeGranularity = $params['time_granularity'] ?? null;
                    if (!$timeGranularity || !in_array($timeGranularity, ['day', 'month', 'year'])) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng thời gian hợp lệ (ngày, tháng, hoặc năm) để tôi có thể tìm phòng được đặt ít nhất.']);
                    }

                    $query = Booking::select('room_type', DB::raw('COUNT(*) as booking_count'))
                                    ->groupBy('room_type')
                                    ->orderBy('booking_count', 'asc')
                                    ->orderBy('room_type', 'asc');

                    if ($timeGranularity === 'day') {
                        $specificDate = $params['specific_date'] ?? null;
                        if ($specificDate === 'hôm nay') {
                            $specificDate = Carbon::today()->format('Y-m-d');
                        }
                        if (!$specificDate) {
                            return response()->json(['response' => 'Vui lòng cung cấp ngày cụ thể (VD: hôm nay hoặc 25/05/2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $date = Carbon::createFromFormat('Y-m-d', $specificDate);
                        $query->whereDate('checkin_date', '<=', $date)
                              ->whereDate('checkout_date', '>=', $date);
                        $periodLabel = "ngày " . $date->format('d/m/Y');
                    } elseif ($timeGranularity === 'month') {
                        $specificMonth = $params['specific_month'] ?? null;
                        if (!$specificMonth) {
                            return response()->json(['response' => 'Vui lòng cung cấp tháng cụ thể (VD: 05/2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $monthStart = Carbon::createFromFormat('Y-m', $specificMonth)->startOfMonth();
                        $monthEnd = $monthStart->copy()->endOfMonth();
                        $query->where('checkin_date', '<=', $monthEnd)
                              ->where('checkout_date', '>=', $monthStart);
                        $monthName = $monthStart->locale('vi')->monthName;
                        $periodLabel = "tháng {$monthName} năm {$monthStart->year}";
                    } else {
                        $specificYear = $params['specific_year'] ?? null;
                        if (!$specificYear) {
                            return response()->json(['response' => 'Vui lòng cung cấp năm cụ thể (VD: 2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $yearStart = Carbon::createFromFormat('Y', $specificYear)->startOfYear();
                        $yearEnd = $yearStart->copy()->endOfYear();
                        $query->where('checkin_date', '<=', $yearEnd)
                              ->where('checkout_date', '>=', $yearStart);
                        $periodLabel = "năm {$specificYear}";
                    }

                    $leastBooked = $query->first();
                    Log::info('Least booked room query result:', ['time_granularity' => $timeGranularity, 'result' => $leastBooked]);
                    if (!$leastBooked) {
                        Log::warning('No bookings found for least booked room');
                        return response()->json(['response' => "Không có dữ liệu đặt phòng nào trong {$periodLabel}."]);
                    }
                    $response = "Phòng được đặt ít nhất trong {$periodLabel} là loại phòng {$leastBooked->room_type} với {$leastBooked->booking_count} lượt đặt.";
                    return response()->json(['response' => $response]);

                case 'room_price_range':
                    $minPrice = $params['min_price'] ?? null;
                    $maxPrice = $params['max_price'] ?? null;
                    if (!$minPrice || !$maxPrice || !is_numeric($minPrice) || !is_numeric($maxPrice) || $minPrice < 0 || $maxPrice < $minPrice) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng giá hợp lệ (VD: từ 400.000 đến 600.000 VNĐ).']);
                    }
                    $response = "Các phòng trong khoảng giá từ " . number_format($minPrice, 0, ',', '.') . " đến " . number_format($maxPrice, 0, ',', '.') . " VNĐ/đêm:\n\n" . $this->getRoomsInPriceRange($minPrice, $maxPrice);
                    return response()->json(['response' => $response]);

                case 'non_hotel':
                    return response()->json(['response' => $apiResponse['response'] ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.']);

                default:
                    Log::warning('Unrecognized intent: ' . $intent);
                    return response()->json(['response' => 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.']);
            }
        } catch (\Exception $e) {
            Log::error('Database query error: ' . $e->getMessage());
            return response()->json(['response' => 'Lỗi khi truy vấn cơ sở dữ liệu: ' . $e->getMessage()], 500);
        }
    }
}