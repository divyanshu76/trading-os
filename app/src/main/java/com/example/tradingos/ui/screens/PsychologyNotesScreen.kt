package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.tradingos.data.model.DailyReviewEntity
import com.example.tradingos.data.model.NoteEntity
import com.example.tradingos.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PsychologyNotesScreen(
    reviews: List<DailyReviewEntity>,
    notes: List<NoteEntity>,
    onSaveReview: (String, Int, Int, String, String, String) -> Unit,
    onSaveNote: (String, String, String) -> Unit,
    onDeleteNote: (NoteEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    var showAddNoteDialog by remember { mutableStateOf(false) }
    var showReviewDialog by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize().background(OceanBackground)) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Psychology & Notes", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                        Text("Discipline mindset and strategy playbook", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                    }
                }
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = { showReviewDialog = true },
                        modifier = Modifier.weight(1f).height(46.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Psychology, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Daily Review")
                    }

                    OutlinedButton(
                        onClick = { showAddNoteDialog = true },
                        modifier = Modifier.weight(1f).height(46.dp),
                        shape = RoundedCornerShape(12.dp),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(OceanBorder))
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp), tint = OceanPrimary)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("New Playbook Note", color = CharcoalDark)
                    }
                }
            }

            // Recent Daily Reviews
            item {
                Text("DAILY PSYCHOLOGY REVIEWS", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }

            if (reviews.isEmpty()) {
                item {
                    Text("No daily reviews recorded yet. Log your daily discipline and mood!", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                }
            } else {
                items(reviews.take(3), key = { it.id }) { rev ->
                    Card(
                        modifier = Modifier.fillMaxWidth().border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                        colors = CardDefaults.cardColors(containerColor = OceanSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(rev.date, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Text("Discipline: ${rev.disciplineScore}/10", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = ProfitGreen)
                                    Text("Mood: ${rev.mood}/10", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = OceanPrimary)
                                }
                            }
                            if (rev.whatWentWell.isNotBlank()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text("Well: " + rev.whatWentWell, style = MaterialTheme.typography.bodyMedium, color = CharcoalDark)
                            }
                            if (rev.focusTomorrow.isNotBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Focus: " + rev.focusTomorrow, style = MaterialTheme.typography.bodyMedium, color = OceanPrimary)
                            }
                        }
                    }
                }
            }

            // Strategy Playbook Notes
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text("STRATEGY PLAYBOOK & LESSONS", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }

            items(notes, key = { it.id }) { note ->
                Card(
                    modifier = Modifier.fillMaxWidth().border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(note.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text(note.folder, style = MaterialTheme.typography.labelSmall, color = OceanPrimary)
                            }
                            IconButton(onClick = { onDeleteNote(note) }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = CharcoalLight, modifier = Modifier.size(18.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(note.content, style = MaterialTheme.typography.bodyMedium, color = CharcoalDark)
                    }
                }
            }
        }

        // Add Review Dialog
        if (showReviewDialog) {
            var mood by remember { mutableStateOf(8f) }
            var discipline by remember { mutableStateOf(8f) }
            var well by remember { mutableStateOf("") }
            var focus by remember { mutableStateOf("") }

            Dialog(onDismissRequest = { showReviewDialog = false }) {
                Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = OceanSurface)) {
                    Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Log Daily Review", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

                        Text("Discipline Score: ${discipline.toInt()}/10", style = MaterialTheme.typography.bodyMedium)
                        Slider(value = discipline, onValueChange = { discipline = it }, valueRange = 1f..10f, steps = 8)

                        Text("Mood / Mindset: ${mood.toInt()}/10", style = MaterialTheme.typography.bodyMedium)
                        Slider(value = mood, onValueChange = { mood = it }, valueRange = 1f..10f, steps = 8)

                        OutlinedTextField(value = well, onValueChange = { well = it }, label = { Text("What went well today?") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = focus, onValueChange = { focus = it }, label = { Text("Focus for tomorrow") }, modifier = Modifier.fillMaxWidth())

                        Button(
                            onClick = {
                                val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                                onSaveReview(today, mood.toInt(), discipline.toInt(), well, "", focus)
                                showReviewDialog = false
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Save Daily Review", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Add Note Dialog
        if (showAddNoteDialog) {
            var title by remember { mutableStateOf("") }
            var folder by remember { mutableStateOf("Strategies") }
            var content by remember { mutableStateOf("") }

            Dialog(onDismissRequest = { showAddNoteDialog = false }) {
                Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = OceanSurface)) {
                    Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("New Playbook Note", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Note Title") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = folder, onValueChange = { folder = it }, label = { Text("Category / Folder") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Content / Rules") }, minLines = 3, modifier = Modifier.fillMaxWidth())

                        Button(
                            onClick = {
                                if (title.isNotBlank()) {
                                    onSaveNote(title, folder, content)
                                    showAddNoteDialog = false
                                }
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Save Note", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
