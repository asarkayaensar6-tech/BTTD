# BTDD V30.56 — ASARKAYA uygulama adı

Bu yama, doğrulanmış V30.55 paketinin kök dizininden `BTDD_V30_56.patch` olarak uygulanır.

- Windows masaüstü ve Başlat menüsü kısayol adı, yerel uygulama pencere başlığı, iPhone ana ekranı ve web uygulaması görünür adı ASARKAYA oldu.
- Bilgi fişindeki marka BTDD olarak bırakıldı.
- Var olan BTDD.exe adı, kurulum yolu, `%LOCALAPPDATA%\\BTDD` veri alanı, senkron/API adları ve iPhone bağlantı yardımcı dosyaları geriye dönük uyumluluk için korundu.
- Sürüm: 3.0.56.0.

## Doğrulama

Marka/fiş/geriye uyumluluk testleri, frontend 53, satış analizleri, akıllı asistan, senkron, gün sonu/veri güvenliği, tablo uyarıları ve grafik geometrisi kontrolleri geçti. Statik kontrol ve ZIP testi geçti.

Gerçek Windows kurulum derlemesi ve fiziksel cihaz/tarayıcı testi bu çalışma ortamında yapılmadı. Main dalı README yer tutucusu olduğundan bu PR sadece sürüm yama paketini ekler; tüm uygulama kaynak ağacının main'e taşındığını ileri sürmez.
