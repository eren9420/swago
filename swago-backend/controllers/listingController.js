const Listing = require('../models/Listing');

const categoryCostMap = {
  'cleaning': 50,
  'gardening': 40,
  'cooking': 30,
  'software-development': 100,
  'graphic-design': 70,
  'language-teaching': 60,
  'plumbing': 60,
  'tutoring': 50,
  'babysitting': 80,
  'car_repair': 100,
  'pet_sitting': 40,
  'it_support': 100,
  'painting': 70,
};

exports.getAllListings = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const listings = await Listing.find(filter).populate('user', 'name email'); 

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'İlanlar getirilemedi.', error });
  }
};


exports.addListing = async (req, res) => {
  const { title, category, details } = req.body;
  try {
    const tokenCost = categoryCostMap[category] || 50;

    const listing = await Listing.create({
      user: req.user.id,   
      title,
      category,
      details,
      tokenCost           
    });

    const populatedListing = await Listing.findById(listing._id)
      .populate('user', 'name email');
      
    res.status(201).json({ message: 'İlan başarıyla eklendi.', listing: populatedListing });
  } catch (error) {
    res.status(500).json({ message: 'İlan eklenemedi.', error });
  }
};

exports.getTradedListings = async (req, res) => {
    try {
      const listings = await Listing.find({ user: req.user.id, isTraded: true });
      res.status(200).json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Takaslanan ilanlar getirilemedi.', error });
    }
  };
  
  exports.getCategories = (req, res) => {
    const categories = [
        { id: 'cleaning', name: 'Temizlik', description: 'Ev ve ofis temizliği hizmetleri.' },
        { id: 'gardening', name: 'Bahçe İşleri', description: 'Bahçe düzenleme, çim biçme ve bitki bakımı hizmetleri.' },
        { id: 'cooking', name: 'Yemek', description: 'Evde özel yemek yapma ve pişirme hizmetleri.' },
        { id: 'software-development', name: 'Yazılım Geliştirme', description: 'Web geliştirme, uygulama geliştirme ve diğer yazılım hizmetleri.' },
        { id: 'graphic-design', name: 'Grafik Tasarım', description: 'Logo tasarımı, poster tasarımı ve diğer grafik hizmetleri.' },
        { id: 'language-teaching', name: 'Dil Eğitimi', description: 'Yabancı dil öğretme ve özel ders hizmetleri.' },
        { id: 'plumbing', name: 'Tesisat', description: 'Tesisat tamir ve bakım hizmetleri.' },
        { id: 'tutoring', name: 'Özel Ders', description: 'Matematik, fen veya diğer dersler için özel öğretim.' },
        { id: 'babysitting', name: 'Çocuk Bakımı', description: 'Çocuk bakıcılığı hizmetleri.' },
        { id: 'car_repair', name: 'Araba Tamiri', description: 'Araba bakım ve tamir hizmetleri.' },
        { id: 'pet_sitting', name: 'Evcil Hayvan Bakımı', description: 'Evcil hayvanlara bakıcılık hizmeti.' },
        { id: 'it_support', name: 'IT Desteği', description: 'Bilgisayar ve teknik destek hizmetleri.' },
        { id: 'painting', name: 'Boyama', description: 'Ev veya ofis içi boyama hizmetleri.' }
    ];
    res.status(200).json(categories);
};


exports.takasListing = async (req, res) => {
  try {
    const { listingId } = req.body;
    const takasUser = req.user; 
    
    const listing = await Listing.findById(listingId).populate('user');
    if (!listing) {
      return res.status(404).json({ message: 'İlan bulunamadı.' });
    }
    if (listing.isTraded) {
      return res.status(400).json({ message: 'Bu ilan zaten takaslanmış.' });
    }

    const cost = listing.tokenCost; 

    if (takasUser.tokenBalance < cost) {
      return res.status(400).json({ message: 'Yetersiz token bakiyesi.' });
    }

    takasUser.tokenBalance -= cost;      
    listing.user.tokenBalance += cost;   

    listing.isTraded = true;

    await takasUser.save();
    await listing.user.save();
    await listing.save();

    return res.json({ message: 'Takas başarıyla gerçekleştirildi.', listing });
  } catch (error) {
    console.error('Takas error:', error);
    return res.status(500).json({ message: 'Sunucu hatası. Takas gerçekleşmedi.' });
  }
};


exports.crossTrade = async (req, res) => {
  try {
    const { myListingId, otherListingId } = req.body;
    const userA = req.user;

    const myListing = await Listing.findById(myListingId).populate('user');
    if (!myListing) {
      return res.status(404).json({ message: 'Kendi ilanınız bulunamadı.' });
    }
    if (myListing.user._id.toString() !== userA._id.toString()) {
      return res.status(403).json({ message: 'Bu ilan size ait değil.' });
    }
    if (myListing.isTraded) {
      return res.status(400).json({ message: 'Kendi ilanınız zaten takaslanmış.' });
    }

    const otherListing = await Listing.findById(otherListingId).populate('user');
    if (!otherListing) {
      return res.status(404).json({ message: 'Karşı tarafın ilanı bulunamadı.' });
    }
    if (otherListing.isTraded) {
      return res.status(400).json({ message: 'Bu ilan zaten takaslanmış.' });
    }

    const costA = myListing.tokenCost;      
    const costB = otherListing.tokenCost;    
    const userB = otherListing.user;         

    const diff = costB - costA;
    if (diff > 0) {
      if (userA.tokenBalance < diff) {
        return res.status(400).json({ message: 'Token bakiyeniz yetersiz.' });
      }
      userA.tokenBalance -= diff;
      userB.tokenBalance += diff;
    } else if (diff < 0) {
      const needed = Math.abs(diff);
      if (userB.tokenBalance < needed) {
        return res.status(400).json({ message: 'Karşı tarafın tokenı yetersiz.' });
      }
      userB.tokenBalance -= needed;
      userA.tokenBalance += needed;
    }

    myListing.isTraded = true;
    otherListing.isTraded = true;

    await userA.save();          
    await userB.save();          
    await myListing.save();
    await otherListing.save();

    res.json({ 
      message: 'Çapraz takas başarılı!', 
      myListing, 
      otherListing 
    });
  } catch (error) {
    console.error('crossTrade error:', error);
    res.status(500).json({ message: 'Sunucu hatası.', error });
  }
};
