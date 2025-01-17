import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const tabs = ['History', 'Processing', 'Packaging', 'Delivering'];

const OrderScreen = () => {
  const [activeTab, setActiveTab] = useState('History');

  const renderContent = () => {
    switch (activeTab) {
      case 'History':
        return <Text>History Content</Text>;
      case 'Processing':
        return <Text>Processing Content</Text>;
      case 'Packaging':
        return <Text>Packaging Content</Text>;
      case 'Delivering':
        return <Text>Delivering Content</Text>;
      default:
        return null;
    }
  };

  return (
    <BackgroundProvider>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 }}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={{
                padding: 10,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: activeTab === tab ? 'blue' : 'transparent'
              }}
            >
              <Text style={{ fontSize: 16 }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {renderContent()}
        </View>
      </View>
    </BackgroundProvider>
  );
};

export default OrderScreen;
