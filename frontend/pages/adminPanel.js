import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { BarChart } from "react-native-gifted-charts/dist/BarChart";
import { LineChart } from "react-native-gifted-charts/dist/LineChart";

import api from "../axios";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 48;

function getLast7Days() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(
      d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
    );
  }
  return labels;
}

function countPerDay(items, dateField) {
  const today = new Date();
  return getLast7Days().map((_, i) => {
    const target = new Date();
    target.setDate(today.getDate() - (6 - i));
    return items.filter((item) => {
      const d = new Date(item[dateField]);
      return (
        d.getDate() === target.getDate() &&
        d.getMonth() === target.getMonth() &&
        d.getFullYear() === target.getFullYear()
      );
    }).length;
  });
}

/* ─── Custom Donut Chart (View-based, no SVG) ──────────────── */
function RoleDonut({ adminCount, userCount, total }) {
  const adminPct = total > 0 ? Math.round((adminCount / total) * 100) : 0;
  const userPct = 100 - adminPct;

  return (
    <View style={donutStyles.wrapper}>
      {/* Segmented arc simulation using stacked bordered views */}
      <View style={donutStyles.ringContainer}>
        <View style={donutStyles.ring}>
          {/* Admin arc segment */}
          <View
            style={[
              donutStyles.segment,
              {
                backgroundColor: "#a855f7",
                width: `${adminPct}%`,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
                borderTopRightRadius: adminPct === 100 ? 6 : 0,
                borderBottomRightRadius: adminPct === 100 ? 6 : 0,
              },
            ]}
          />
          {/* User arc segment */}
          <View
            style={[
              donutStyles.segment,
              {
                backgroundColor: "#86e72b",
                width: `${userPct}%`,
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                borderTopLeftRadius: userPct === 100 ? 6 : 0,
                borderBottomLeftRadius: userPct === 100 ? 6 : 0,
              },
            ]}
          />
        </View>
        <View style={donutStyles.center}>
          <Text style={donutStyles.centerValue}>{total}</Text>
          <Text style={donutStyles.centerLabel}>Total</Text>
        </View>
      </View>

      {/* Legends */}
      <View style={donutStyles.legends}>
        <View style={donutStyles.legendRow}>
          <View style={[donutStyles.dot, { backgroundColor: "#86e72b" }]} />
          <View>
            <Text style={donutStyles.legendTitle}>Users</Text>
            <Text style={donutStyles.legendVal}>
              {userCount} ({userPct}%)
            </Text>
          </View>
        </View>
        <View style={donutStyles.legendRow}>
          <View style={[donutStyles.dot, { backgroundColor: "#a855f7" }]} />
          <View>
            <Text style={donutStyles.legendTitle}>Admins</Text>
            <Text style={donutStyles.legendVal}>
              {adminCount} ({adminPct}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */
function StatCard({ label, value, icon, colors, sub }) {
  return (
    <LinearGradient
      colors={colors}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </LinearGradient>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function UserRow({ item, onDelete }) {
  return (
    <View style={styles.tableRow}>
      <LinearGradient
        colors={["#1e1e2e", "#252540"]}
        style={styles.tableRowInner}
      >
        <View style={styles.rowAvatar}>
          <Text style={styles.rowAvatarText}>
            {item.username?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowName}>{item.username}</Text>
          <Text style={styles.rowEmail}>{item.email}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            item.role === "admin"
              ? styles.roleBadgeAdmin
              : styles.roleBadgeUser,
          ]}
        >
          <Text style={styles.roleBadgeText}>
            {item.role === "admin" ? "👑 Admin" : "👤 User"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item._id, item.username)}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

function MsgRow({ item, onDelete }) {
  const preview =
    item.message?.length > 42 ? item.message.slice(0, 42) + "…" : item.message;
  const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
  return (
    <View style={styles.tableRow}>
      <LinearGradient
        colors={["#1e1e2e", "#252540"]}
        style={styles.tableRowInner}
      >
        <Text style={styles.msgIcon}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowName}>{preview}</Text>
          <Text style={styles.rowEmail}>{date}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item._id)}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
 
export const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    try {
      const [uRes, mRes] = await Promise.all([
        api.get("/dashboard/users"),
        api.get("/dashboard/messages"),
      ]);
      setUsers(uRes.data.users ?? []);
      setMessages(mRes.data.messages ?? []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  /* derived stats */
  const totalUsers = users.length;
  const totalMessages = messages.length;
  const onlineUsers = users.filter((u) => u.isOnline).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  /* chart data */
  const days = getLast7Days();
  const msgPerDay = countPerDay(messages, "createdAt");
  const barData = days.map((label, i) => ({
    value: msgPerDay[i],
    label,
    frontColor: "#86e72b",
    gradientColor: "#4caf50",
    topLabelComponent: () =>
      msgPerDay[i] > 0 ? (
        <Text style={{ color: "#86e72b", fontSize: 9, marginBottom: 2 }}>
          {msgPerDay[i]}
        </Text>
      ) : null,
  }));

  const regPerDay = countPerDay(users, "createdAt");
  const lineData = days.map((label, i) => ({
    value: regPerDay[i],
    label,
    dataPointColor: "#a855f7",
    dataPointRadius: 5,
  }));

  /* delete handlers */
  const handleDeleteUser = (id, name) => {
    Alert.alert("Delete User", `Remove "${name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/dashboard/user/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
          } catch {
            Alert.alert("Error", "Could not delete user.");
          }
        },
      },
    ]);
  };

  const handleDeleteMessage = (id) => {
    Alert.alert("Delete Message", "Remove this message permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/dashboard/message/${id}`);
            setMessages((prev) => prev.filter((m) => m._id !== id));
          } catch {
            Alert.alert("Error", "Could not delete message.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0d0d1a", "#12122a"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#86e72b" />
        <Text style={styles.loadingText}>Loading Dashboard…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0d0d1a", "#12122a"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "users", label: "👥 Users" },
          { key: "messages", label: "💬 Messages" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#86e72b"
          />
        }
      >
        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <>
            {/* Stat cards */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Total Users"
                value={totalUsers}
                icon="👥"
                colors={["#1a2a1a", "#233323"]}
                sub={`${onlineUsers} online`}
              />
              <StatCard
                label="Messages"
                value={totalMessages}
                icon="💬"
                colors={["#1a1a2e", "#1f1f42"]}
              />
              <StatCard
                label="Online"
                value={onlineUsers}
                icon="🟢"
                colors={["#1a2415", "#1e2e18"]}
              />
              <StatCard
                label="Admins"
                value={adminUsers}
                icon="👑"
                colors={["#221a2e", "#2a1e3e"]}
              />
            </View>

            {/* Bar chart — messages/day */}
            <View style={styles.chartCard}>
              <SectionHeader title="Messages — Last 7 Days" icon="📈" />
              <BarChart
                data={barData}
                width={CHART_W - 32}
                height={180}
                barWidth={28}
                spacing={14}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: "#666", fontSize: 10 }}
                xAxisLabelTextStyle={{ color: "#888", fontSize: 10 }}
                noOfSections={4}
                isAnimated
                animationDuration={800}
                gradientColor="#4caf50"
                showGradient
              />
            </View>

            {/* Line chart — signups/day */}
            <View style={styles.chartCard}>
              <SectionHeader title="User Signups — Last 7 Days" icon="📉" />
              <LineChart
                data={lineData}
                width={CHART_W - 40}
                height={160}
                color="#a855f7"
                thickness={3}
                startFillColor="rgba(168,85,247,0.35)"
                endFillColor="rgba(168,85,247,0)"
                areaChart
                curved
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: "#666", fontSize: 10 }}
                xAxisLabelTextStyle={{ color: "#888", fontSize: 10 }}
                dataPointsColor="#a855f7"
                dataPointsRadius={5}
                noOfSections={4}
                isAnimated
                animationDuration={800}
              />
            </View>

            {/* Role breakdown — custom View-based (no SVG) */}
            <View style={styles.chartCard}>
              <SectionHeader title="User Roles Breakdown" icon="🥧" />
              <RoleDonut
                adminCount={adminUsers}
                userCount={totalUsers - adminUsers}
                total={totalUsers}
              />
            </View>
          </>
        )}

        {/* ══ USERS ══ */}
        {activeTab === "users" && (
          <>
            <SectionHeader title={`All Users (${totalUsers})`} icon="👥" />
            {users.map((u) => (
              <UserRow key={u._id} item={u} onDelete={handleDeleteUser} />
            ))}
            {users.length === 0 && (
              <Text style={styles.emptyText}>No users found.</Text>
            )}
          </>
        )}

        {/* ══ MESSAGES ══ */}
        {activeTab === "messages" && (
          <>
            <SectionHeader
              title={`All Messages (${totalMessages})`}
              icon="💬"
            />
            {messages.map((m) => (
              <MsgRow key={m._id} item={m} onDelete={handleDeleteMessage} />
            ))}
            {messages.length === 0 && (
              <Text style={styles.emptyText}>No messages found.</Text>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

/* ─── Donut Styles ────────────────────────────────────────── */
const donutStyles = StyleSheet.create({
  wrapper: { alignItems: "center", paddingTop: 4 },
  ringContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  ring: {
    width: "90%",
    height: 22,
    flexDirection: "row",
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#2a2a3e",
  },
  segment: { height: "100%" },
  center: { alignItems: "center", marginTop: 12 },
  centerValue: { color: "#fff", fontFamily: "Fugaz", fontSize: 28 },
  centerLabel: { color: "#888", fontSize: 11, marginTop: 2 },
  legends: { flexDirection: "row", gap: 28, justifyContent: "center" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  legendTitle: { color: "#ccc", fontFamily: "Fugaz", fontSize: 13 },
  legendVal: { color: "#666", fontSize: 11, marginTop: 1 },
});

/* ─── Main Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: { color: "#86e72b", fontFamily: "Fugaz", fontSize: 16 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#11112299",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(134,231,43,0.12)",
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 11 },
  tabActive: { backgroundColor: "rgba(134,231,43,0.15)" },
  tabText: { color: "#666", fontSize: 12, fontFamily: "Fugaz" },
  tabTextActive: { color: "#86e72b" },

  scroll: { paddingHorizontal: 16, paddingTop: 14 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_W - 56) / 2,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#86e72b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: { fontSize: 26, marginBottom: 8 },
  statValue: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Fugaz",
    lineHeight: 34,
  },
  statLabel: { color: "#888", fontSize: 12, fontFamily: "Fugaz", marginTop: 4 },
  statSub: { color: "#86e72b", fontSize: 11, marginTop: 3 },

  chartCard: {
    backgroundColor: "#131324",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { color: "#fff", fontFamily: "Fugaz", fontSize: 15 },

  tableRow: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tableRowInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
  },
  rowAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#86e72b22",
    borderWidth: 1.5,
    borderColor: "#86e72b",
    alignItems: "center",
    justifyContent: "center",
  },
  rowAvatarText: { color: "#86e72b", fontFamily: "Fugaz", fontSize: 18 },
  rowName: { color: "#fff", fontFamily: "Fugaz", fontSize: 14 },
  rowEmail: { color: "#666", fontSize: 11, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  roleBadgeAdmin: { backgroundColor: "rgba(168,85,247,0.2)" },
  roleBadgeUser: { backgroundColor: "rgba(134,231,43,0.12)" },
  roleBadgeText: { color: "#ccc", fontSize: 11, fontFamily: "Fugaz" },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 16 },
  msgIcon: { fontSize: 22 },
  emptyText: {
    color: "#555",
    fontFamily: "Fugaz",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
