<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('winning_bidder_id')->nullable()->constrained('customers')->onDelete('cascade');
            $table->string('item_name');
            $table->text('item_description');
            $table->decimal('starting_bid', 10, 2);
            $table->decimal('bid_increment', 10, 2);
            $table->timestamp('auction_start_time')->nullable();
            $table->timestamp('auction_end_time')->nullable();
            $table->timestamp('auction_actual_end_time')->nullable();
            $table->enum('auction_status', ['Open', 'Closed'])->default('Closed');
            $table->enum('approval_status', ['approved', 'pending', 'rejected'])->default('pending');
            $table->string('item_country');
            $table->timestamps();
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
