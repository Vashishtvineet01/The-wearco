/// Local cart line — mirrors the web `CartItem` but only the fields the
/// mobile app needs to render + check out. Custom design is omitted in this
/// shell (added back when the Studio port ships).
class CartItem {
  const CartItem({
    required this.id,
    required this.slug,
    required this.name,
    required this.price,
    required this.qty,
    required this.size,
    required this.color,
    required this.colorHex,
    required this.fabricHex,
    required this.category,
  });

  final String id;
  final String slug;
  final String name;
  final int price;
  final int qty;
  final String size;
  final String color;
  final String colorHex;
  final String fabricHex;
  final String category;

  int get lineTotal => price * qty;

  CartItem copyWith({int? qty}) {
    return CartItem(
      id: id,
      slug: slug,
      name: name,
      price: price,
      qty: qty ?? this.qty,
      size: size,
      color: color,
      colorHex: colorHex,
      fabricHex: fabricHex,
      category: category,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'name': name,
        'price': price,
        'qty': qty,
        'size': size,
        'color': color,
        'colorHex': colorHex,
        'fabricHex': fabricHex,
        'category': category,
      };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        id: json['id'] as String,
        slug: json['slug'] as String,
        name: json['name'] as String,
        price: (json['price'] as num).toInt(),
        qty: (json['qty'] as num).toInt(),
        size: json['size'] as String,
        color: json['color'] as String,
        colorHex: json['colorHex'] as String,
        fabricHex: json['fabricHex'] as String,
        category: json['category'] as String,
      );
}
