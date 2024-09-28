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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 10, 2);
            // $table->enum('payment_status', ['Pending', 'Completed'])->default('Pending');
            // $table->string('payment_method');
            $table->timestamp('transaction_date')->useCurrent();
            // $table->foreignId('winning_bidder_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bidder_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('auction_id')->constrained('auctions')->onDelete('cascade');
            // $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');     
            // $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
