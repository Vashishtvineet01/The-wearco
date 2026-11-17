import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_providers.dart';
import '../../core/models/order.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../widgets/brand_mark.dart';

/// Account tab — guest-first.
///
/// TheWearCo intentionally doesn't require sign-in to shop: cart lives in
/// local shared_preferences, checkout is guest + email only. This screen
/// gives guests the two things they actually ask for:
///
///   1. a way to look up an existing order by its 10-char order number
///      (same number shown on the checkout success screen + emailed receipt)
///   2. quick links — contact, shipping, bulk enquiry, about
///
/// When we add real user accounts later, this becomes the profile hub.
class AccountScreen extends ConsumerStatefulWidget {
  const AccountScreen({super.key});

  @override
  ConsumerState<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends ConsumerState<AccountScreen> {
  final _formKey = GlobalKey<FormState>();
  final _orderCtl = TextEditingController();

  bool _loading = false;
  String? _error;
  OrderPublic? _order;

  @override
  void dispose() {
    _orderCtl.dispose();
    super.dispose();
  }

  Future<void> _lookUp() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _error = null;
      _order = null;
    });
    try {
      final api = ref.read(orderApiProvider);
      final order = await api.getByNumber(_orderCtl.text.trim());
      setState(() => _order = order);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Could not reach the order lookup service.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            BrandMark(size: 26),
            SizedBox(width: 10),
            Text('Account'),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _GuestCard(),
              const SizedBox(height: 16),
              _SectionLabel('Track your order'),
              const SizedBox(height: 8),
              Form(
                key: _formKey,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _orderCtl,
                        textCapitalization: TextCapitalization.characters,
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(
                              RegExp('[a-zA-Z0-9-]')),
                          LengthLimitingTextInputFormatter(20),
                        ],
                        decoration: const InputDecoration(
                          hintText: 'TWC-XXXXXX',
                          labelText: 'ORDER NUMBER',
                        ),
                        validator: (v) {
                          final s = (v ?? '').trim();
                          if (s.isEmpty) return 'Enter an order number';
                          if (s.length < 4) return 'Too short';
                          return null;
                        },
                        onFieldSubmitted: (_) => _lookUp(),
                      ),
                    ),
                    const SizedBox(width: 10),
                    SizedBox(
                      height: 54,
                      child: FilledButton(
                        onPressed: _loading ? null : _lookUp,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.signalViolet,
                          foregroundColor: AppColors.ink50,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                          padding:
                              const EdgeInsets.symmetric(horizontal: 20),
                        ),
                        child: _loading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(
                                      AppColors.ink50),
                                ),
                              )
                            : const Icon(Icons.search, size: 20),
                      ),
                    ),
                  ],
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.signalCoral.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.signalCoral.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline,
                          color: AppColors.signalCoral, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _error!,
                          style: const TextStyle(
                            color: AppColors.signalCoral,
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (_order != null) ...[
                const SizedBox(height: 14),
                _OrderCard(order: _order!),
              ],
              const SizedBox(height: 28),
              _SectionLabel('Quick links'),
              const SizedBox(height: 8),
              _LinkRow(
                icon: Icons.inventory_2_outlined,
                label: 'Bulk & team orders',
                sublabel: 'Volume pricing, custom printing',
                onTap: () {
                  // Switch to the Bulk tab by rebuilding the shell —
                  // easiest path is to just pop to /bulk route.
                  context.go('/bulk');
                },
              ),
              _LinkRow(
                icon: Icons.local_shipping_outlined,
                label: 'Shipping & returns',
                sublabel: '5–7 day DTG prints, pan-India',
                onTap: () => _showInfoSheet(
                  context,
                  title: 'Shipping & returns',
                  body:
                      'Every piece is made-to-order and DTG printed. Orders ship in 5–7 working days anywhere in India. Returns are accepted within 7 days of delivery for manufacturing defects only — custom-printed artwork is non-returnable unless misprinted on our side.',
                ),
              ),
              _LinkRow(
                icon: Icons.mail_outline,
                label: 'Contact us',
                sublabel: 'hi@thewearco.com',
                onTap: () => _showInfoSheet(
                  context,
                  title: 'Say hi',
                  body:
                      'We reply within one business day. For bulk orders use the Bulk tab — it attaches your quote automatically.\n\nhi@thewearco.com',
                ),
              ),
              _LinkRow(
                icon: Icons.info_outline,
                label: 'About TheWearCo',
                sublabel: 'The internet uniform.',
                onTap: () => _showInfoSheet(
                  context,
                  title: 'TheWearCo',
                  body:
                      'Internet uniform for founders, creators, freelancers and the terminally online.\n\nMonthly drops + a Design Studio on the web so you can print your own art on tees, hoodies, mugs, pins, posters and more.',
                ),
              ),
              const SizedBox(height: 28),
              Center(
                child: Column(
                  children: [
                    const BrandMark(size: 32),
                    const SizedBox(height: 10),
                    Text(
                      'TheWearCo · v1.0',
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GuestCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.signalViolet.withValues(alpha: 0.18),
            AppColors.signalCoral.withValues(alpha: 0.10),
            AppColors.signalLime.withValues(alpha: 0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.signalViolet.withValues(alpha: 0.35),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.ink950.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.person_outline,
                color: AppColors.ink50, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Browsing as guest',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 2),
                Text(
                  'No sign-in needed to shop. Accounts coming soon.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
        '// ${text.toUpperCase()}',
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AppColors.signalLime,
            ),
      );
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final String sublabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white10),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.ink200, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sublabel,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right,
                color: AppColors.ink400, size: 20),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final OrderPublic order;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.signalLime.withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                order.orderNumber,
                style: const TextStyle(
                  fontFamily: 'JetBrainsMono',
                  fontSize: 14,
                  color: AppColors.signalLime,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.signalLime.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: AppColors.signalLime.withValues(alpha: 0.4),
                  ),
                ),
                child: Text(
                  order.status.toUpperCase(),
                  style: const TextStyle(
                    fontFamily: 'JetBrainsMono',
                    fontSize: 10,
                    color: AppColors.signalLime,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '${order.items.length} item${order.items.length == 1 ? '' : 's'} · ${formatInr(order.total)}',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 4),
          Text(
            'Placed ${_relativeTime(order.createdAt)} · ${order.paymentMethod.toUpperCase()}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

String _relativeTime(DateTime t) {
  final diff = DateTime.now().difference(t);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays < 30) return '${diff.inDays}d ago';
  final months = (diff.inDays / 30).floor();
  if (months < 12) return '${months}mo ago';
  return '${(diff.inDays / 365).floor()}y ago';
}

void _showInfoSheet(BuildContext context,
    {required String title, required String body}) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: AppColors.ink900,
    isScrollControlled: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (ctx) => Padding(
      padding: EdgeInsets.fromLTRB(
        24,
        0,
        24,
        24 + MediaQuery.of(ctx).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(ctx).textTheme.displayMedium),
          const SizedBox(height: 10),
          Text(body, style: Theme.of(ctx).textTheme.bodyLarge),
          const SizedBox(height: 18),
        ],
      ),
    ),
  );
}
