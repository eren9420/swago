# **Swago Dashboard Projesi**

Bu proje, kullanıcı profili yönetimi, mesajlaşma ve ilan oluşturma işlevlerini içeren bir dashboard uygulamasıdır.

## **Özellikler**
- Kullanıcı profili güncelleme
- İlan ekleme, listeleme ve takaslanan ilanlar
- Gerçek zamanlı mesajlaşma sistemi
- MongoDB tabanlı veritabanı kullanımı

---

## **Kurulum**

### **1. Gereksinimler**
- Node.js (v14 veya üzeri)
- MongoDB (yerel veya bulut tabanlı bağlantı)
- Git (versiyon kontrolü için)

### **2. Projeyi İndir**
```bash
git clone https://github.com/kullaniciAdi/projeAdi.git
cd projeAdi

npm install

PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

npm start

Uygulama http://localhost:5001 adresinde çalışacaktır.

