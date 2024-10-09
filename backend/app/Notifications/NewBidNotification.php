<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewBidNotification extends Notification
{
    use Queueable;

    protected $auction;
    protected $bid;

    public function __construct($auction, $bid)
    {
        $this->auction = $auction;
        $this->bid = $bid;
    }

    /**
     * Determine which channels the notification should be delivered on.
     *
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'auction' => $this->auction->item_name,
            "user" => $this->bid->customer->user->name . " placed a bid on this auction",
            "bid_amount" => $this->bid->bid_amount
        ];
    }
    /**

     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Bid on Your Auction: ' . $this->auction->item_name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($this->bid->customer->user->name . ' placed a bid on this auction: ' . $this->auction->item_name)
            ->line('bid: ' . $this->bid->bid_amount)
            ->action('View Auction', url('/auctions/' . $this->auction->id))
            ->line('Thank you for using our auction platform!');
    }
}
