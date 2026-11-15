/// Immutable representation of a product returned by `/api/v1/products`.
/// Mirrors the TypeScript `Product` type in `lib/products.ts`.
class Product {
  const Product({
    required this.slug,
    required this.name,
    required this.tagline,
    required this.category,
    required this.price,
    required this.drop,
    required this.description,
    required this.printArea,
    required this.printShape,
    required this.colors,
    required this.sizes,
    required this.details,
    required this.customizable,
  });

  final String slug;
  final String name;
  final String tagline;
  final String category;
  final int price; // INR
  final String drop;
  final String description;
  final PrintArea printArea;
  final String printShape; // rect | circle | cylinder | full
  final List<ProductColor> colors;
  final List<String> sizes;
  final List<String> details;
  final bool customizable;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      slug: json['slug'] as String,
      name: json['name'] as String,
      tagline: json['tagline'] as String? ?? '',
      category: json['category'] as String,
      price: (json['price'] as num).toInt(),
      drop: json['drop'] as String? ?? '',
      description: json['description'] as String? ?? '',
      printArea: PrintArea.fromJson(
        (json['printArea'] as Map).cast<String, dynamic>(),
      ),
      printShape: json['printShape'] as String? ?? 'rect',
      colors: (json['colors'] as List? ?? [])
          .map((c) => ProductColor.fromJson((c as Map).cast<String, dynamic>()))
          .toList(),
      sizes: (json['sizes'] as List? ?? []).map((s) => s as String).toList(),
      details:
          (json['details'] as List? ?? []).map((s) => s as String).toList(),
      customizable: json['customizable'] as bool? ?? true,
    );
  }
}

class PrintArea {
  const PrintArea({
    required this.x,
    required this.y,
    required this.w,
    required this.h,
  });

  final double x;
  final double y;
  final double w;
  final double h;

  factory PrintArea.fromJson(Map<String, dynamic> json) => PrintArea(
        x: (json['x'] as num).toDouble(),
        y: (json['y'] as num).toDouble(),
        w: (json['w'] as num).toDouble(),
        h: (json['h'] as num).toDouble(),
      );
}

class ProductColor {
  const ProductColor({
    required this.name,
    required this.hex,
    required this.fabric,
    required this.printDefault,
  });

  final String name;
  final String hex;
  final String fabric;
  final String printDefault;

  factory ProductColor.fromJson(Map<String, dynamic> json) => ProductColor(
        name: json['name'] as String,
        hex: json['hex'] as String,
        fabric: json['fabric'] as String,
        printDefault: json['printDefault'] as String,
      );
}
