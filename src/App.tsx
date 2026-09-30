import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import ProfileScreen from './screens/ProfileScreen';
import {ReleaseProvider} from './state';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ReleaseProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Compose" component={HomeScreen} />
          <Tab.Screen name="Preview" component={ExploreScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ReleaseProvider>
  );
}
