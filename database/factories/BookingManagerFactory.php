<?php

namespace Database\Factories;

use App\Models\BookingManager;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingManagerFactory extends Factory
{
    protected $model = BookingManager::class;

    public function definition()
    {
        $lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Ngô', 'Đoàn'];
        $firstNames = ['Anh', 'Bích', 'Nam', 'Tú', 'Mai', 'Hùng', 'Lan', 'Minh', 'Tùng', 'Hương'];
        $vietnameseUsernames = [];
        for ($i = 0; $i < 100; $i++) {
            $lastName = $this->faker->randomElement($lastNames);
            $firstName = $this->faker->randomElement($firstNames);
            $vietnameseUsernames[] = strtolower(str_replace(' ', '_', $lastName . '_' . $firstName));
        }

        $phonePrefixes = ['090', '091', '092', '093', '094', '095', '096', '097', '098', '099'];
        $phoneNumber = $this->faker->randomElement($phonePrefixes) . $this->faker->numberBetween(1000000, 9999999);

        $roomTypes = ['Standard', 'Superior', 'Family', 'Deluxe', 'Suite'];
        $checkinDate = $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'); // Từ now đến 1 tháng sau
        $checkoutDate = $this->faker->dateTimeBetween($checkinDate, '+1 month')->format('Y-m-d'); // Từ checkinDate + 1 tháng

        $price = $this->faker->numberBetween(500000, 5000000);
        $numberOfRooms = $this->faker->numberBetween(1, 5);
        $totalPrice = $price * $numberOfRooms;

        $checkStatuses = ['not checked in', 'checked in', 'checked out'];
        $checkStatus = $this->faker->randomElement($checkStatuses);
        $actualCheckIn = null;
        $actualCheckOut = null;

        // Chỉ tạo actual_check_in/actual_check_out nếu checkinDate không trong tương lai quá xa
        if ($checkStatus === 'checked in' || $checkStatus === 'checked out') {
            $currentDate = new \DateTime('now');
            $checkinDateTime = new \DateTime($checkinDate);
            if ($checkinDateTime <= $currentDate) {
                $actualCheckIn = $this->faker->dateTimeBetween($checkinDate, 'now');
            }
        }
        if ($checkStatus === 'checked out' && $actualCheckIn) {
            $actualCheckOut = $this->faker->dateTimeBetween($actualCheckIn, 'now');
        }

        return [
            'user_id' => null,
            'name' => $this->faker->randomElement($lastNames) . ' ' . $this->faker->randomElement($firstNames),
            'email' => $this->faker->randomElement($vietnameseUsernames) . '@gmail.com',
            'phone' => $phoneNumber,
            'room_type' => $this->faker->randomElement($roomTypes),
            'number_of_rooms' => $numberOfRooms,
            'children' => $this->faker->numberBetween(0, 3),
            'member' => $this->faker->numberBetween(1, 4),
            'price' => $price,
            'total_price' => $totalPrice,
            'checkin_date' => $checkinDate,
            'checkout_date' => $checkoutDate,
            'room_id' => $this->faker->numberBetween(1, 100),
            'check_status' => $checkStatus,
            'actual_check_in' => $actualCheckIn ? $actualCheckIn->format('Y-m-d H:i:s') : null,
            'actual_check_out' => $actualCheckOut ? $actualCheckOut->format('Y-m-d H:i:s') : null,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}