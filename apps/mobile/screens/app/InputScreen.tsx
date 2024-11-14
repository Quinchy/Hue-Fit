import React, { useState } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, HStack, Center, Select, CheckIcon, Box, IconButton } from 'native-base';
import { ArrowLeft } from 'lucide-react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';

const InputScreen: React.FC = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState('My 2025 Outfit Drip');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('60');
  const [skinTone, setSkinTone] = useState('#fc1c27d');
  const [age, setAge] = useState('20');
  const [bodyShape, setBodyShape] = useState('Pear');
  const [outfitStyle, setOutfitStyle] = useState('Casual');
  const [preferredColor, setPreferredColor] = useState<string[]>([]);

  const colorOptions = ['#ffffff', '#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#00ffff'];

  return (
    <BackgroundProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header with Back Button and Logo */}
          <HStack justifyContent="space-between" alignItems="center" mt={10} px={4}>
            <IconButton
              icon={<ArrowLeft size={24} color="white" />}
              onPress={() => navigation.goBack()}
            />
            <Image
              source={require('../../assets/icons/hue-fit-logo.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </HStack>

          <Center mt={10}>
            <GradientCard>
              <Center mb={6}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  CREATE OUTFIT
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Please fill the form to generate your tailored outfit.
                </Text>
              </Center>

              {/* Input Form */}
              <VStack space={4}>
                <CustomInput
                  placeholder="Outfit Name"
                  value={outfitName}
                  onChangeText={setOutfitName}
                  variant="filled"
                  bg="gray.700"
                  color="white"
                  placeholderTextColor="gray.400"
                />
                <CustomInput
                  placeholder="Height (in cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  variant="filled"
                  bg="gray.700"
                  color="white"
                  placeholderTextColor="gray.400"
                />
                <CustomInput
                  placeholder="Weight (in kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  variant="filled"
                  bg="gray.700"
                  color="white"
                  placeholderTextColor="gray.400"
                />
                <CustomInput
                  placeholder="Skin Tone"
                  value={skinTone}
                  onChangeText={setSkinTone}
                  variant="filled"
                  bg="gray.700"
                  color="white"
                  placeholderTextColor="gray.400"
                />
                <CustomInput
                  placeholder="Your Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  variant="filled"
                  bg="gray.700"
                  color="white"
                  placeholderTextColor="gray.400"
                />

                {/* Select Components */}
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>Body Shape</Text>
                  <Select
                    selectedValue={bodyShape}
                    minWidth="200"
                    accessibilityLabel="Choose Body Shape"
                    placeholder="Choose Body Shape"
                    _selectedItem={{
                      bg: "gray.700",
                      endIcon: <CheckIcon size="5" />,
                    }}
                    mt={1}
                    onValueChange={(itemValue) => setBodyShape(itemValue)}
                    bg="gray.700"
                    color="white"
                  >
                    <Select.Item label="Pear" value="Pear" />
                    <Select.Item label="Rectangle" value="Rectangle" />
                    <Select.Item label="Hourglass" value="Hourglass" />
                    <Select.Item label="Inverted Triangle" value="Inverted Triangle" />
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>Outfit Style</Text>
                  <Select
                    selectedValue={outfitStyle}
                    minWidth="200"
                    accessibilityLabel="Choose Outfit Style"
                    placeholder="Choose Outfit Style"
                    _selectedItem={{
                      bg: "gray.700",
                      endIcon: <CheckIcon size="5" />,
                    }}
                    mt={1}
                    onValueChange={(itemValue) => setOutfitStyle(itemValue)}
                    bg="gray.700"
                    color="white"
                  >
                    <Select.Item label="Casual" value="Casual" />
                    <Select.Item label="Formal" value="Formal" />
                    <Select.Item label="Smart Casual" value="Smart Casual" />
                    <Select.Item label="Sportswear" value="Sportswear" />
                  </Select>
                </Box>

                {/* Color Selector */}
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>Preferred Color</Text>
                  <HStack space={2}>
                    {colorOptions.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setPreferredColor((prev) => 
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        )}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: color,
                          borderWidth: preferredColor.includes(color) ? 2 : 0,
                          borderColor: "white",
                        }}
                      />
                    ))}
                  </HStack>
                </Box>

                {/* Generate Button */}
                <DefaultButton title="GENERATE" onPress={() => console.log('Generate Outfit')} />
              </VStack>
            </GradientCard>
          </Center>
        </ScrollView>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

export default InputScreen;
