import React, { useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, HStack, Center, IconButton, Select } from 'native-base';
import { ArrowLeft } from 'lucide-react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import CustomSelect from '../../components/Select';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import LoadingSpinner from '../../components/Loading'; // For loading animation

const InputScreen: React.FC = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [bodyShape, setBodyShape] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true); // Show the loading spinner

    const userFeatures = {
      outfitName: outfitName,
      height: parseFloat(height),
      weight: parseFloat(weight),
      skintone: skinTone,
      bodyshape: bodyShape,
      age: parseInt(age, 10),
    };
    try {
      console.log(userFeatures);
      const response = await fetch(
        `https://hue-fit-ai.onrender.com/generate-outfit?unique=${Date.now()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Connection: 'close',
          },
          body: JSON.stringify(userFeatures),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLoading(false); // Stop loading spinner
        navigation.navigate('Playground', { 
          outfitData: data.outfit, 
          outfitName: data.outfit_name // Pass outfit_name to Playground
        }); 
      } else {
        console.error('Error generating outfit:', response.statusText);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner
      size={200}
      messages={[
        'Matching multiple clothing items...',
        'Creating a personalized color palette...',
        'Browsing curated styles...',
        'Finalizing the best outfit for you...',
      ]}
      visible={true}
    />
    ; // Keep showing the loading spinner until data is fetched
  }

  return (
    <BackgroundProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header with Back Button and Logo */}
          <HStack justifyContent="space-between" alignItems="center" mt={10} px={4}>
            <IconButton
              icon={<ArrowLeft size={24} color="white" />}
              onPress={() => navigation.goBack()}
              _pressed={{ bg: 'gray.700' }}
              borderRadius={"full"}
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
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  GENERATE AN OUTFIT
                </Text>
                <Text fontSize="md" color="gray.400" fontWeight="light" textAlign="center">
                  Please fill the form to generate a tailored outfit.
                </Text>
              </Center>

              {/* Input Form */}
              <VStack space={4}>
                <CustomInput
                  label="Outfit Name"
                  placeholder="Type an Outfit Name"
                  value={outfitName}
                  onChangeText={setOutfitName}
                  variant="filled"
                />
                <CustomInput
                  label="Height"
                  placeholder="Type your Height (in cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  variant="filled"
                />
                <CustomInput
                  label="Weight"
                  placeholder="Type your Weight (in kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  variant="filled"
                />
                <CustomSelect
                  label="Skin Tone"
                  value={skinTone} // Bind state value
                  onChange={(value) => setSkinTone(value)} // Update state
                >
                  <Select.Item label="Fair" value="Fair" />
                  <Select.Item label="Light" value="Light" />
                  <Select.Item label="Medium" value="Medium" />
                  <Select.Item label="Dark" value="Dark" />
                  <Select.Item label="Deep" value="Deep" />
                </CustomSelect>
                <CustomSelect
                  label="Body Shape"
                  value={bodyShape} // Bind state value
                  onChange={(value) => setBodyShape(value)} // Update state
                >
                  <Select.Item label="Pear" value="Pear" />
                  <Select.Item label="Apple" value="Apple" />
                  <Select.Item label="Rectangle" value="Rectangle" />
                  <Select.Item label="Triangle" value="Triangle" />
                  <Select.Item label="Oval" value="Oval" />
                  <Select.Item label="Athletic" value="Athletic" />
                </CustomSelect>
                <CustomInput
                  label="Age"
                  placeholder="Type your Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  variant="filled"
                />
                {/* Generate Button */}
                <DefaultButton my={10} title="GENERATE" onPress={handleGenerate} />
              </VStack>
            </GradientCard>
          </Center>
        </ScrollView>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

export default InputScreen;
