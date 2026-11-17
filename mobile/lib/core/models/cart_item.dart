/// Local cart line — mirrors the web `CartItem` but only the fields the
/// mobile app needs to render + check out.
///
/// Optional [printText]/[printTextColor] turn a line into a custom print
/// from the Design tab. When present the cart row shows a "CUSTOM" chip and
/// the text that will be printed.
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
    this.printShape = 'rect',
    this.printText,
    this.printTextColor,
    this.printFontFamily,
    this.printImageUrl,
    this.printPosX = 0,
    this.printPosY = 0,
    this.printScale = 1,
    this.printRotation = 0,
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
  final String printShape;
  final String? printText;
  final String? printTextColor;

  /// One of 'display', 'mono', 'sans' — mirrors web `FONTS` in StudioClient.
  final String? printFontFamily;

  /// Server path returned by `/api/uploads/design` (or null if the Studio
  /// line is text-only / the upload failed in demo mode).
  final String? printImageUrl;

  /// Transforms applied to the text + image overlay. -50..50 for pos, 0.4..1.6
  /// for scale, -45..45 for rotation — kept identical to web ranges.
  final double printPosX;
  final double printPosY;
  final double printScale;
  final double printRotation;

  bool get isCustom =>
      (printText != null && printText!.trim().isNotEmpty) ||
      (printImageUrl != null && printImageUrl!.isNotEmpty);

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
      printShape: printShape,
      printText: printText,
      printTextColor: printTextColor,
      printFontFamily: printFontFamily,
      printImageUrl: printImageUrl,
      printPosX: printPosX,
      printPosY: printPosY,
      printScale: printScale,
      printRotation: printRotation,
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
        'printShape': printShape,
        if (printText != null) 'printText': printText,
        if (printTextColor != null) 'printTextColor': printTextColor,
        if (printFontFamily != null) 'printFontFamily': printFontFamily,
        if (printImageUrl != null) 'printImageUrl': printImageUrl,
        if (printPosX != 0) 'printPosX': printPosX,
        if (printPosY != 0) 'printPosY': printPosY,
        if (printScale != 1) 'printScale': printScale,
        if (printRotation != 0) 'printRotation': printRotation,
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
        printShape: (json['printShape'] as String?) ?? 'rect',
        printText: json['printText'] as String?,
        printTextColor: json['printTextColor'] as String?,
        printFontFamily: json['printFontFamily'] as String?,
        printImageUrl: json['printImageUrl'] as String?,
        printPosX: (json['printPosX'] as num?)?.toDouble() ?? 0,
        printPosY: (json['printPosY'] as num?)?.toDouble() ?? 0,
        printScale: (json['printScale'] as num?)?.toDouble() ?? 1,
        printRotation: (json['printRotation'] as num?)?.toDouble() ?? 0,
      );
}
