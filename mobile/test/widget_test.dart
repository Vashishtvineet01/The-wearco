// Basic smoke test — ensures the app constructs and renders without throwing.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:thewearco/app.dart';

void main() {
  testWidgets('App boots without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: TheWearCoApp()),
    );
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
