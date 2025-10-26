// SoundChain Music NFT Contract for Sui Blockchain
// Enables producers to mint music NFTs and buyers to purchase licenses

module soundchain::music_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::vector;

    /// Music NFT representing ownership of a track
    public struct MusicNFT has key, store {
        id: UID,
        title: String,
        artist: String,
        description: String,
        audio_url: String,
        cover_art_url: String,
        genre: vector<String>,
        bpm: u64,
        price: u64, // Price in MIST (1 SUI = 1_000_000_000 MIST)
        creator: address,
    }

    /// License NFT representing usage rights
    public struct LicenseNFT has key, store {
        id: UID,
        music_nft_id: ID,
        usage_rights: vector<String>, // ["youtube", "commercial", "streaming"]
        duration_days: u64,
        price_paid: u64,
        buyer: address,
        created_at: u64, // Epoch timestamp
    }

    /// Event emitted when music NFT is minted
    public struct MusicNFTMinted has copy, drop {
        nft_id: ID,
        title: String,
        artist: String,
        creator: address,
    }

    /// Event emitted when license is purchased
    public struct LicensePurchased has copy, drop {
        license_id: ID,
        music_nft_id: ID,
        buyer: address,
        price: u64,
    }

    /// Error codes
    const EInsufficientPayment: u64 = 0;

    /// Mint a new Music NFT
    /// Creates an NFT representing a music track with metadata
    public entry fun mint(
        title: vector<u8>,
        artist: vector<u8>,
        description: vector<u8>,
        audio_url: vector<u8>,
        cover_art_url: vector<u8>,
        genre: vector<vector<u8>>,
        bpm: u64,
        price: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Convert genre bytes to strings
        let mut genre_strings = vector::empty<String>();
        let mut i = 0;
        let genre_len = vector::length(&genre);
        while (i < genre_len) {
            vector::push_back(&mut genre_strings, string::utf8(*vector::borrow(&genre, i)));
            i = i + 1;
        };

        let nft = MusicNFT {
            id: object::new(ctx),
            title: string::utf8(title),
            artist: string::utf8(artist),
            description: string::utf8(description),
            audio_url: string::utf8(audio_url),
            cover_art_url: string::utf8(cover_art_url),
            genre: genre_strings,
            bpm,
            price,
            creator: sender,
        };

        let nft_id = object::id(&nft);

        event::emit(MusicNFTMinted {
            nft_id,
            title: nft.title,
            artist: nft.artist,
            creator: sender,
        });

        // Transfer NFT to minter
        transfer::public_transfer(nft, sender);
    }

    /// Purchase license for a Music NFT
    /// Buyer pays creator and receives a license NFT with usage rights
    public entry fun purchase_license(
        music_nft: &MusicNFT,
        usage_rights: vector<vector<u8>>,
        duration_days: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let price = coin::value(&payment);

        // Verify payment amount is sufficient
        assert!(price >= music_nft.price, EInsufficientPayment);

        // Transfer payment to music creator
        transfer::public_transfer(payment, music_nft.creator);

        // Convert usage_rights bytes to strings
        let mut rights_strings = vector::empty<String>();
        let mut i = 0;
        let rights_len = vector::length(&usage_rights);
        while (i < rights_len) {
            vector::push_back(&mut rights_strings, string::utf8(*vector::borrow(&usage_rights, i)));
            i = i + 1;
        };

        // Create license NFT
        let license = LicenseNFT {
            id: object::new(ctx),
            music_nft_id: object::id(music_nft),
            usage_rights: rights_strings,
            duration_days,
            price_paid: price,
            buyer,
            created_at: tx_context::epoch(ctx),
        };

        let license_id = object::id(&license);

        event::emit(LicensePurchased {
            license_id,
            music_nft_id: object::id(music_nft),
            buyer,
            price,
        });

        // Transfer license to buyer
        transfer::public_transfer(license, buyer);
    }

    /// Get Music NFT details (view function)
    public fun get_music_nft_details(nft: &MusicNFT): (String, String, String, u64) {
        (nft.title, nft.artist, nft.audio_url, nft.price)
    }

    /// Get License details (view function)
    public fun get_license_details(license: &LicenseNFT): (ID, address, u64, u64) {
        (license.music_nft_id, license.buyer, license.price_paid, license.duration_days)
    }

    /// Transfer Music NFT to another address
    public entry fun transfer_nft(
        nft: MusicNFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient);
    }

    /// Update Music NFT price (creator only)
    public entry fun update_price(
        nft: &mut MusicNFT,
        new_price: u64,
        ctx: &mut TxContext
    ) {
        // Only creator can update price
        assert!(tx_context::sender(ctx) == nft.creator, 1);
        nft.price = new_price;
    }
}
