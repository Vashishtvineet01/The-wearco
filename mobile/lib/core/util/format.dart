import 'package:intl/intl.dart';

final _inr = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

/// Format an INR integer (paise-less) as "₹1,299".
String formatInr(num amount) => _inr.format(amount);

/// Parse "#rrggbb" into a Flutter-compatible integer ARGB value.
int parseHexColor(String hex) {
  var h = hex.replaceAll('#', '').trim();
  if (h.length == 6) h = 'FF$h';
  return int.parse(h, radix: 16);
}
