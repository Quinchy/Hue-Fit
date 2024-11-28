import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import { HStack } from 'native-base';
import DefaultButton from "../../components/Button";
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_API_URL } from '@env';

const ProductViewScreen = ({ route }) => {
  const { productVariantNo } = route.params;
  const [loading, setLoading] = useState(false);
  const [productDetailsCache, setProductDetailsCache] = useState({});
  const [selectedVariantNo, setSelectedVariantNo] = useState(productVariantNo);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const createOrder = async (selectedSizeId, selectedColorId, quantity, shopNo) => {
    try {
      // Retrieve userId from AsyncStorage
      const userId = await AsyncStorage.getItem('user')
        .then((user) => (user ? JSON.parse(user).id : null));
  
      if (!userId) {
        console.error('User ID not found');
        return;
      }
  
      // Prepare payload
      console.log('Creating order with:', userId, shopNo, selectedSizeId, selectedColorId, quantity);
      const payload = {
        userId, // Retrieved from AsyncStorage
        shopNo,
        productVariantNo: productVariantNo,
        sizeName: selectedSizeId,
        colorName: selectedColorId,
        quantity,
      };
      console.log('Order payload:', payload);
      // Make the POST request to the API
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/orders/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      // Handle response
      if (response.ok) {
        const responseData = await response.json();
        console.log('Order created successfully:', responseData);
        return responseData;
      } else {
        console.error('Failed to create order:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const fetchProductDetails = async (variantNo) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/products/get-product-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productVariantNo: variantNo }),
        }
      );
      const data = await response.json();

      // Cache all variants with full details
      const variantCache = {};
      data.allVariants.forEach((variant) => {
        variantCache[variant.productVariantNo] = {
          ...variant,
          details: variant.productVariantNo === data.selectedVariant.productVariantNo
            ? data.selectedVariant
            : null, // Preload details for selected variant only
        };
      });

      // Ensure all variant details are preloaded
      const preloadVariants = await Promise.all(
        data.allVariants.map(async (variant) => {
          if (!variantCache[variant.productVariantNo].details) {
            const response = await fetch(
              `${EXPO_PUBLIC_API_URL}/api/mobile/products/get-product-details`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productVariantNo: variant.productVariantNo }),
              }
            );
            const variantData = await response.json();
            return {
              productVariantNo: variant.productVariantNo,
              details: variantData.selectedVariant,
            };
          }
          return null;
        })
      );

      preloadVariants.forEach((variant) => {
        if (variant) {
          variantCache[variant.productVariantNo].details = variant.details;
        }
      });

      setProductDetailsCache((prevCache) => ({ ...prevCache, ...variantCache }));
      setProductDetails(data);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!productDetailsCache[selectedVariantNo]) {
      fetchProductDetails(selectedVariantNo);
    } else {
      const cachedVariantDetails = productDetailsCache[selectedVariantNo].details;
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        selectedVariant: cachedVariantDetails,
      }));
    }
  }, [selectedVariantNo]);

  if (loading || !productDetails) {
    return (
      <BackgroundProvider>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#fff' }}>Loading product details...</Text>
        </View>
      </BackgroundProvider>
    );
  }

  const { parentProduct, selectedVariant, allVariants } = productDetails;

  return (
    <BackgroundProvider>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            {/* Images Section */}
            <FlatList
              data={selectedVariant?.images || []}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View>
                  <Image
                    source={{ uri: item }}
                    style={{ width: 360, height: 400 }}
                    resizeMode="cover"
                  />
                </View>
              )}
            />

            {/* Product Name */}
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'Thin', marginBottom: 10, marginTop: 10, paddingHorizontal: 20, color: '#fff', }}>
                {parentProduct?.name || 'Product Name'}
              </Text>
              <Text style={{ fontSize: 28, marginBottom: 10, fontWeight: 'bold', paddingHorizontal: 20, color: '#ccc', }}>
                ₱{selectedVariant?.price}
              </Text>
            </View>
            {/* Sizes and Measurement Section */}
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#fff', paddingHorizontal: 20, }}>
                Sizes and Measurements:
            </Text>
            <View style={{ marginHorizontal: 20, borderWidth: 1, borderColor: '#333', borderRadius: 5, backgroundColor: '#222', overflow: 'hidden', }}>
                {/* Table Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#444', }}>
                    <Text style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: 'bold', }}>
                        SIZE
                    </Text>
                    {selectedVariant?.sizes[0]?.measurements.map((measurement, index) => (
                        <Text key={index} style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: 'bold', }}>
                            {measurement.name.toUpperCase()}
                        </Text>
                    ))}
                    <Text style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: 'bold', }}>
                        QUANTITY
                    </Text>
                </View>
                {/* Table Rows */}
                {selectedVariant?.sizes.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#444', }}>
                        <Text style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, }}>
                            {item.sizeName}
                        </Text>
                        {item.measurements.map((measurement, idx) => (
                            <Text key={idx} style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, }}>
                                {measurement.fullUnit || 'N/A'}
                            </Text>
                        ))}
                        <Text style={{ flex: 1, color: '#fff', textAlign: 'center', fontSize: 14, }}>
                            {item.quantity}
                        </Text>
                    </View>
                ))}
            </View>
            {/* Select a Size Section */}
            <Text style={{fontSize: 20,fontWeight: 'bold',marginTop: 20,marginBottom: 10,color: '#fff',paddingHorizontal: 20,}}>
                Select a Size:
            </Text>
            <View style={{flexDirection: 'row',flexWrap: 'wrap',marginHorizontal: 20}}>
                {selectedVariant?.sizes.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedSize(item.sizeName)} // Set selected size
                        style={{padding: 10,backgroundColor: selectedSize === item.sizeName ? '#007bff' : '#555',borderRadius: 5,margin: 5,minWidth: 80,alignItems: 'center'}}
                    >
                        <Text style={{color: '#fff',fontSize: 14}}>
                            {item.sizeName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={{marginTop: 10,paddingHorizontal: 20,color: '#ccc',fontSize: 16}}>
              Selected Size: {selectedSize || 'None'}
            </Text>
            {/* Color Selection */}
            <Text style={{fontSize: 20,fontWeight: 'bold',marginTop: 20,marginBottom: 10,paddingHorizontal: 20,color: '#fff',}}>
              Select a Color:
            </Text>
            <FlatList
              data={allVariants || []}
              horizontal
              style={{ marginBottom: 10, marginHorizontal: 20 }}
              keyExtractor={(item) => item.productVariantNo}
              renderItem={({ item }) => (
                <TouchableOpacity style={{padding: 10,backgroundColor: item.productVariantNo === selectedVariantNo ? '#007bff' : '#555',borderRadius: 5,marginHorizontal: 5,}}
                  onPress={() => setSelectedVariantNo(item.productVariantNo)}
                >
                  <Text style={{color: '#fff'}}>
                    {item.color}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Text style={{ fontSize: 16, marginBottom: 10, paddingHorizontal: 20, color: '#ccc',}}>
              Selected Color: {selectedVariant?.color}
            </Text>
            {/* Quantity Section */}
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, paddingHorizontal: 20, color: '#fff' }}>
              Quantity:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              {/* Decrement Button */}
              <TouchableOpacity
                onPress={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginRight: 10 }}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>-</Text>
              </TouchableOpacity>

              {/* Quantity Input */}
              <TextInput
                value={quantity.toString()} // Convert quantity to string for TextInput
                onChangeText={(text) => {
                  // Allow empty input for backspace
                  if (text === '') {
                    setQuantity('');
                  } else {
                    const parsedValue = parseInt(text, 10);
                    // Validate and set quantity if it's a valid number and greater than 0
                    if (!isNaN(parsedValue) && parsedValue > 0) {
                      setQuantity(parsedValue);
                    }
                  }
                }}
                onBlur={() => {
                  // Reset to 1 if the field is left empty
                  if (quantity === '') {
                    setQuantity(1);
                  }
                }}
                keyboardType="numeric"
                style={{
                  textAlign: 'center',
                  backgroundColor: '#333',
                  color: '#fff',
                  fontSize: 16,
                  width: 60,
                  padding: 5,
                  borderRadius: 5,
                  marginHorizontal: 10,
                }}
              />

              {/* Increment Button */}
              <TouchableOpacity
                onPress={() => setQuantity((prev) => prev + 1)}
                style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginLeft: 10 }}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
            {/* End of Product View */}
            <HStack alignItems="center" space={3} paddingX={5} marginTop={20} marginBottom={20}>
              <Image
                source={{
                  uri: parentProduct?.shop?.logo || 'https://via.placeholder.com/100', // Placeholder image URL
                }}
                style={{width: 50,height: 50,borderRadius: 10}}
              />
              <Text style={{fontSize: 18,marginBottom: 10,color: '#ccc'}}>
                Shop Name: {parentProduct?.shop?.name || 'Shop Name Not Available'}
              </Text>
            </HStack>
            <View style={{paddingHorizontal: 15,marginBottom: 70,}}>
            <DefaultButton
              title={`Order`} // Show selected size in button text
              onPress={async () => {
                if (!selectedSize || !selectedVariantNo || !quantity) {
                  console.error('Please select a size, color, and specify a valid quantity.');
                  return;
                }

                // Use the selected values directly
                const selectedSizeName = selectedSize; // Directly use selected size
                const selectedColor = selectedVariant?.color; // Use the color name from the selected variant
                const shopNo = parentProduct?.shop?.shopNo; // Use the shopNo from parent product
                console.log('Ordering:', selectedSizeName, selectedColor, quantity, shopNo);
                // Ensure necessary values are present
                if (!selectedSizeName || !selectedColor || !shopNo) {
                  console.error('Required data is missing: size, color, or shopNo.');
                  return;
                }

                // Call createOrder function
                await createOrder(selectedSizeName, selectedColor, quantity, shopNo);
              }}
            />

            </View>
          </>
        }
        keyExtractor={() => 'dummy'}
      />
    </BackgroundProvider>
  );
};

export default ProductViewScreen;
