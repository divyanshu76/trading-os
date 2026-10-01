package com.example.tradingos.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun MetricCard(
    title: String,
    value: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    isProfit: Boolean? = null
) {
    Card(
        modifier = modifier
            .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = OceanSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            Text(
                text = title.uppercase(Locale.ROOT),
                style = MaterialTheme.typography.labelSmall,
                color = CharcoalMuted,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            val valueColor = when (isProfit) {
                true -> ProfitGreen
                false -> LossRed
                null -> CharcoalDark
            }
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = valueColor
                )
            )
            if (subtitle != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = CharcoalLight
                )
            }
        }
    }
}

@Composable
fun EquityCurveChart(
    trades: List<TradeEntity>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = OceanSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "EQUITY CURVE",
                    style = MaterialTheme.typography.labelSmall,
                    color = CharcoalMuted,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                val totalPnl = trades.sumOf { it.netPnl }
                val pnlFormatted = (if (totalPnl >= 0) "+$" else "-$") + String.format(Locale.US, "%.2f", kotlin.math.abs(totalPnl))
                Text(
                    text = pnlFormatted,
                    style = MaterialTheme.typography.labelLarge,
                    color = if (totalPnl >= 0) ProfitGreen else LossRed,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            val points = mutableListOf<Float>()
            var acc = 0f
            points.add(acc)
            for (t in trades.reversed()) {
                acc += t.netPnl.toFloat()
                points.add(acc)
            }

            if (points.size < 2) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No trade history to render curve", color = CharcoalMuted, style = MaterialTheme.typography.bodyMedium)
                }
            } else {
                val minVal = points.minOrNull() ?: 0f
                val maxVal = points.maxOrNull() ?: 0f
                val range = if (maxVal == minVal) 1f else maxVal - minVal

                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                ) {
                    val w = size.width
                    val h = size.height
                    val step = w / (points.size - 1)

                    val linePath = Path()
                    val fillPath = Path()

                    for (i in points.indices) {
                        val x = i * step
                        val normalizedY = (points[i] - minVal) / range
                        val y = h - (normalizedY * (h - 20f) + 10f)

                        if (i == 0) {
                            linePath.moveTo(x, y)
                            fillPath.moveTo(x, h)
                            fillPath.lineTo(x, y)
                        } else {
                            linePath.lineTo(x, y)
                            fillPath.lineTo(x, y)
                        }
                    }

                    fillPath.lineTo(w, h)
                    fillPath.close()

                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(OceanPrimary.copy(alpha = 0.25f), Color.Transparent)
                        )
                    )

                    drawPath(
                        path = linePath,
                        color = OceanPrimary,
                        style = Stroke(width = 3.dp.toPx())
                    )

                    // Draw end dot
                    val lastX = (points.size - 1) * step
                    val lastNormalizedY = (points.last() - minVal) / range
                    val lastY = h - (lastNormalizedY * (h - 20f) + 10f)
                    drawCircle(
                        color = OceanPrimaryStrong,
                        radius = 4.dp.toPx(),
                        center = Offset(lastX, lastY)
                    )
                }
            }
        }
    }
}

@Composable
fun TradeCardItem(
    trade: TradeEntity,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, OceanBorder, RoundedCornerShape(14.dp)),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = OceanSurface)
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = trade.symbol,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    val isLong = trade.direction.equals("LONG", ignoreCase = true)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (isLong) ProfitGreenBg else LossRedBg)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = trade.direction.uppercase(Locale.ROOT),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isLong) ProfitGreen else LossRed,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Text(
                        text = "${trade.lotSize} lots",
                        style = MaterialTheme.typography.bodyMedium,
                        color = CharcoalMuted
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "In: ${trade.entryPrice}",
                        style = MaterialTheme.typography.labelSmall,
                        color = CharcoalMuted
                    )
                    trade.exitPrice?.let {
                        Text(
                            text = "Out: $it",
                            style = MaterialTheme.typography.labelSmall,
                            color = CharcoalMuted
                        )
                    }
                    Text(
                        text = trade.session,
                        style = MaterialTheme.typography.labelSmall,
                        color = OceanPrimary
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                val isWin = trade.netPnl > 0
                val pnlText = (if (isWin) "+$" else "-$") + String.format(Locale.US, "%.2f", kotlin.math.abs(trade.netPnl))
                Text(
                    text = pnlText,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = if (isWin) ProfitGreen else LossRed
                    )
                )
                trade.rMultiple?.let { r ->
                    Text(
                        text = "${if (r > 0) "+" else ""}${r}R",
                        style = MaterialTheme.typography.labelSmall,
                        color = CharcoalMuted,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            IconButton(
                onClick = onDelete,
                modifier = Modifier
                    .size(36.dp)
                    .padding(start = 4.dp)
                    .testTag("delete_trade_${trade.id}")
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete Trade",
                    tint = CharcoalLight,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
