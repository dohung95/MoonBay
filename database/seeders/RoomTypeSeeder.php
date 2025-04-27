<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('room_types')->insert([
            [
                'name' => 'Standard Room',
                'capacity' => 2,
                'description' => 'The Standard Room offers a comfortable space with a simple, modern design. Fully equipped with air conditioning, TV, minibar, and a private bathroom, it is ideal for couples or business travelers.',
                'image' => '/images/Huy/room_types_huy/standard.png',
            ],
            [
                'name' => 'Deluxe Room',
                'capacity' => 3,
                'description' => 'The Deluxe Room is spacious and elegantly designed, featuring large windows that let in natural light. Furnished with high-quality amenities and a cozy sitting area, it is perfect for couples or small families looking to relax.',
                'image' => '/images/Huy/room_types_huy/deluxe.png',
            ],
            [
                'name' => 'Superior Room',
                'capacity' => 2,
                'description' => 'The Superior Room comes with a private balcony offering views of the sea or city. It features premium bedding, a work desk, and a modern bathroom, providing a comfortable and stylish stay.',
                'image' => '/images/Huy/room_types_huy/superior.png',
            ],
            [
                'name' => 'Family Room',
                'capacity' => 4,
                'description' => 'The Family Room is designed for groups or families, offering two double beds, a shared living space, and various entertainment amenities. It’s ideal for vacations with loved ones.',
                'image' => '/images/Huy/room_types_huy/family.png',
            ],
            [
                'name' => 'Suite',
                'capacity' => 3,
                'description' => 'The Suite is a premium option featuring separate living and sleeping areas, luxurious furnishings, and stunning views. Guests enjoy welcome drinks, a large bathtub, and exclusive perks.',
                'image' => '/images/Huy/room_types_huy/suite.png',
            ],
        ]);
    }
}
