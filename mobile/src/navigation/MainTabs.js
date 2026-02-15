import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientFormScreen from '../screens/ClientFormScreen';
import TicketsScreen from '../screens/TicketsScreen';
import TicketFormScreen from '../screens/TicketFormScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Logo from '../components/Logo';

const Tab = createBottomTabNavigator();
const ClientsStack = createNativeStackNavigator();
const TicketsStack = createNativeStackNavigator();

const navOpts = {
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#fafafa',
  headerTitleStyle: { fontSize: 18 },
};

function ClientsStackScreen() {
  return (
    <ClientsStack.Navigator screenOptions={navOpts}>
      <ClientsStack.Screen name="ClientsList" component={ClientsScreen} options={{ title: 'Clients' }} />
      <ClientsStack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'New client' }} />
    </ClientsStack.Navigator>
  );
}

function TicketsStackScreen() {
  return (
    <TicketsStack.Navigator screenOptions={navOpts}>
      <TicketsStack.Screen name="TicketsList" component={TicketsScreen} options={{ title: 'Tickets' }} />
      <TicketsStack.Screen name="TicketForm" component={TicketFormScreen} options={{ title: 'New ticket' }} />
      <TicketsStack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Ticket' }} />
    </TicketsStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0a0a0a',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: { backgroundColor: '#fafafa', borderTopColor: '#e5e5e5' },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Logo size={22} color={color} />,
        }}
      />
      <Tab.Screen name="Clients" component={ClientsStackScreen} />
      <Tab.Screen name="Tickets" component={TicketsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
