#!/bin/sh

echo "🚀 Starting JMeter Test Execution"
echo "📊 Test File: $1"
echo "⏰ Timestamp: $(date '+%Y%m%d-%H%M%S')"
echo "💾 Results will be saved to: /results"
echo "🔥 Executing JMeter test..."

# JMeter is installed at /opt/apache-jmeter-5.5/bin/jmeter
JMETER_DIR="/opt/apache-jmeter-5.5"
if [ ! -d "$JMETER_DIR" ]; then
    # Try to find it dynamically
    JMETER_DIR=$(find /opt -name "apache-jmeter-*" -type d | head -n 1)
    if [ -z "$JMETER_DIR" ]; then
        echo "❌ Could not find JMeter installation"
        find /opt -name "*jmeter*" -type d 2>/dev/null || echo "No jmeter directories found"
        exit 1
    fi
fi

echo "📍 Found JMeter at: $JMETER_DIR"

# Create timestamped results directory
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
RESULTS_DIR="/results/Basic_UI_Login_Test-$TIMESTAMP"
mkdir -p "$RESULTS_DIR/reports" "$RESULTS_DIR/logs"

# Check if JMX file exists
if [ ! -f "/tests/$1" ]; then
    echo "❌ Error: JMX file not found: /tests/$1"
    ls -la /tests/
    exit 1
fi

# Run JMeter test
"$JMETER_DIR/bin/jmeter" \
  -n \
  -t "/tests/$1" \
  -l "$RESULTS_DIR/results.jtl" \
  -e \
  -o "$RESULTS_DIR/reports" \
  -j "$RESULTS_DIR/logs/jmeter.log"

echo "✅ Test execution completed!"
echo "📈 Results available at: $RESULTS_DIR"
echo "🌐 Open $RESULTS_DIR/reports/index.html for dashboard"

# Generate summary
echo "📋 Test Summary:" > "$RESULTS_DIR/summary.txt"
echo "Test File: $1" >> "$RESULTS_DIR/summary.txt"
echo "Execution Time: $(date)" >> "$RESULTS_DIR/summary.txt"
echo "Results Directory: $RESULTS_DIR" >> "$RESULTS_DIR/summary.txt"

# Copy results to host volume
cp -r "$RESULTS_DIR"/* "/results/" 2>/dev/null || true

echo "🎉 JMeter execution completed successfully!"
