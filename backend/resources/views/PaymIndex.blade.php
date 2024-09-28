<form method="POST" action="{{ route('checkout', ['auctionID' => 4, 'bidderID' => 1]) }}" class="mt-5" enctype="multipart/form-data">
    @csrf
    <button type="submit">checkout</button>

</form>