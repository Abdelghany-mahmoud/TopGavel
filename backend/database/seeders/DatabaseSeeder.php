<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Auction;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Image;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // // Create 1 admin user
        // User::factory()->create([
        //     'role' => 'admin',
        // ]);
        // Auction::factory()->count(3)->create();

        // $auctions = Auction::all();
        // foreach ($auctions as $auction) {
        //     Image::factory()->count(3)->create([
        //         'auction_id' => $auction->id,
        //         'path' => 'images/sample-image.jpg',
        //     ]);
        // }

        // Category::factory()->count(5)->create();
        Category::factory()->createMany([
            ['name' => 'Birds'],
            ['name' => 'Cars'],
            ['name' => 'Art'],
            ['name' => 'Cats'],
            ['name' => 'Dogs'],
        ]);        
    }
}
