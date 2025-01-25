// ProductViewScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundProvider from '../../providers/BackgroundProvider';
import LoadingSpinner from '../../components/Loading';
import { ShoppingCart, ArrowLeft, Camera } from 'lucide-react-native';
import { Actionsheet, useToast } from 'native-base';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const validationSchema = Yup.object().shape({
  selectedVariant: Yup.object().required('Variant is required'),
  selectedSize: Yup.object().required('Size is required'),
  quantity: Yup.number().min(1, 'Minimum quantity is 1').required('Quantity is required'),
});

const ProductViewScreen = ({ route, navigation }) => {
  const { productId } = route.params;

  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const toast = useToast();

  // Flying animation refs
  const flyingAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyingScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [flyingImage, setFlyingImage] = useState(null);
  const [showFlyingImage, setShowFlyingImage] = useState(false);

  const [showReserveWarning, setShowReserveWarning] = useState(false);
  const [pendingCartValues, setPendingCartValues] = useState(null);

  // 1) Fetch product details from your API
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://192.168.254.105:3000/api/mobile/products/get-product-details',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }
      );
      if (!response.ok) throw new Error('Failed to fetch product details');

      const data = await response.json();
      setProductDetails(data);
      // Pre-select the first variant as default
      setSelectedVariant(data.allVariants[0]);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  if (loading || !productDetails) {
    return <LoadingSpinner size={300} messages="Loading product..." visible />;
  }

  // 2) Destructure the response object
  const { parentProduct, allVariants, measurementChart } = productDetails;
  const shopDetails = parentProduct.shop;

  // 3) Add item to cart (POST)
  const handleAddToCart = async (values) => {
    const userId = await AsyncStorage.getItem('user').then(user =>
      user ? JSON.parse(user).id : null
    );
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    const payload = {
      productId: values.productId,
      productVariantId: values.selectedVariant?.id,
      productVariantSizeId: values.selectedSize?.productVariantSizeId,
      quantity: values.quantity,
      shopId: values.shopId,
      userId,
    };
    const response = await fetch('http://192.168.254.105:3000/api/mobile/cart/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    const result = await response.json();
    console.log(result);
  };

  // 4) Flying animation to cart
  const animateAddToCart = (values) => {
    if (!values.selectedVariant || !values.selectedVariant.images?.[0]) return;
    setFlyingImage(values.selectedVariant.images[0]);

    flyingAnim.setValue({ x: screenWidth / 2 - 25, y: screenHeight - 100 });
    flyingScale.setValue(1);
    fadeAnim.setValue(1);
    setShowFlyingImage(true);

    Animated.parallel([
      Animated.timing(flyingAnim, {
        toValue: { x: screenWidth - 50, y: 40 },
        duration: 800,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(flyingScale, {
        toValue: 0.3,
        duration: 800,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowFlyingImage(false);
    });
  };

  // 5) Low-stock check
  const checkSizeStock = (size) => {
    if (!size) return false;
    return size.quantity <= 5; // 5 or fewer => reservation message
  };

  // 6) Render the screen
  return (
    <BackgroundProvider>
      <Formik
        initialValues={{
          productId,
          shopId: shopDetails?.id || '',
          selectedVariant,
          selectedSize,
          quantity,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const lowStock = checkSizeStock(values.selectedSize);
          if (lowStock) {
            // Show a modal that warns user about low stock
            setShowReserveWarning(true);
            setPendingCartValues(values);
          } else {
            // Add to cart directly
            try {
              await handleAddToCart(values);
              animateAddToCart(values);
              toast.show({
                description: 'Item added to cart.',
                duration: 3000,
                placement: 'top',
              });
            } catch (error) {
              console.error(error);
            }
          }
        }}
        enableReinitialize
      >
        {({ handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.container}>
            {/* The flying image animation to cart */}
            {showFlyingImage && flyingImage && (
              <Animated.Image
                source={{ uri: flyingImage }}
                style={[
                  styles.flyingImage,
                  {
                    transform: [
                      { translateX: flyingAnim.x },
                      { translateY: flyingAnim.y },
                      { scale: flyingScale },
                    ],
                    opacity: fadeAnim,
                  },
                ]}
                resizeMode="contain"
              />
            )}

            {/* Top overlay buttons */}
            <View style={styles.overlayButtonsContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Virtual Fitting Button */}
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    { marginLeft: 10 },
                    !values.selectedVariant?.pngClotheURL && { opacity: 0.5 }
                  ]}
                  onPress={() => {
                    if (values.selectedVariant?.pngClotheURL) {
                      // Pass type & tag from parentProduct (typeName, tagName)
                      navigation.navigate('VirtualFitting', {
                        pngClotheURL: values.selectedVariant.pngClotheURL,
                        type: parentProduct?.typeName ?? '',
                        tag: parentProduct?.tagName ?? '',
                      });
                    }
                  }}
                  disabled={!values.selectedVariant?.pngClotheURL}
                >
                  <Camera color="#fff" size={24} />
                </TouchableOpacity>

                {/* Go to Cart Button */}
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => navigation.navigate('Cart', { fromProduct: true })}
                >
                  <ShoppingCart color="#fff" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main content (images, color/size selection, quantity, etc.) */}
            <FlatList
              data={['placeholder']}
              renderItem={() => null}
              ListHeaderComponent={
                <View style={{ flex: 1, backgroundColor: '#191919' }}>
                  {/* Variants Image Carousel */}
                  {values.selectedVariant && (
                    <FlatList
                      data={values.selectedVariant.images}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      pagingEnabled
                      keyExtractor={(img, index) => `${values.selectedVariant.id}-${index}`}
                      renderItem={({ item: imageUrl }) => (
                        <View>
                          <Image
                            source={{ uri: imageUrl }}
                            style={{
                              width: screenWidth,
                              height: 500,
                              backgroundColor: '#ccc',
                            }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    />
                  )}

                  {/* Variant price */}
                  {values.selectedVariant && (
                    <View style={{ flexDirection: 'row', padding: 10 }}>
                      <Text style={{ fontSize: 24, color: '#fff', fontWeight: '300' }}>PHP </Text>
                      <Text style={{ fontSize: 24, color: '#fff', fontWeight: '600' }}>
                        {values.selectedVariant.price}
                      </Text>
                    </View>
                  )}

                  {/* Product Title + Description */}
                  <View style={{ paddingHorizontal: 10, gap: 20 }}>
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                      <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>
                        {parentProduct?.name || 'Product Name'}
                      </Text>
                      <Text style={{ fontSize: 16, color: '#ccc', fontWeight: '300' }}>
                        {parentProduct?.description || 'No description available.'}
                      </Text>
                    </View>

                    {/* Color Variants */}
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Colors:</Text>
                      <FlatList
                        data={allVariants}
                        horizontal
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              padding: 10,
                              backgroundColor:
                                values.selectedVariant?.id === item.id ? '#fff' : '#4E4E4E',
                              borderRadius: 5,
                              marginRight: 10,
                            }}
                            onPress={() => {
                              setFieldValue('selectedVariant', item);
                              setSelectedVariant(item);
                              setFieldValue('selectedSize', null);
                              setSelectedSize(null);
                              setQuantity(1);
                              setFieldValue('quantity', 1);
                            }}
                          >
                            <Text style={{ color: '#191919' }}>{item.color.name}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      {errors.selectedVariant && touched.selectedVariant && (
                        <Text style={styles.errorText}>{errors.selectedVariant}</Text>
                      )}
                    </View>

                    {/* Sizes */}
                    {values.selectedVariant && (
                      <View style={{ flexDirection: 'column', gap: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                          Sizes:
                        </Text>
                        <FlatList
                          data={values.selectedVariant.sizes}
                          horizontal
                          keyExtractor={(size, idx) => `${values.selectedVariant.id}-size-${idx}`}
                          renderItem={({ item: size }) => {
                            const isSelected = values.selectedSize?.abbreviation === size.abbreviation;
                            return (
                              <TouchableOpacity
                                style={[
                                  styles.sizeBox,
                                  {
                                    backgroundColor: isSelected ? '#fff' : '#4E4E4E',
                                  },
                                ]}
                                onPress={() => {
                                  setFieldValue('selectedSize', size);
                                  setSelectedSize(size);
                                  setQuantity(1);
                                  setFieldValue('quantity', 1);
                                }}
                              >
                                <Text style={{ color: '#191919' }}>{size.abbreviation}</Text>
                              </TouchableOpacity>
                            );
                          }}
                        />
                        {errors.selectedSize && touched.selectedSize && (
                          <Text style={styles.errorText}>{errors.selectedSize}</Text>
                        )}
                        {values.selectedSize && (
                          <Text style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>
                            {values.selectedSize.quantity} pieces available
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Quantity */}
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                        Quantity:
                      </Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1);
                              setFieldValue('quantity', quantity - 1);
                            }
                          }}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{values.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            setQuantity(quantity + 1);
                            setFieldValue('quantity', quantity + 1);
                          }}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      {errors.quantity && touched.quantity && (
                        <Text style={styles.errorText}>{errors.quantity}</Text>
                      )}
                    </View>

                    {/* Size Chart */}
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                        Size Chart:
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#4E4E4E',
                          borderRadius: 5,
                          overflow: 'hidden',
                        }}
                      >
                        {/* Chart Header Row */}
                        <View style={{ flexDirection: 'row', backgroundColor: '#333', padding: 10 }}>
                          <Text
                            style={{
                              flex: 1,
                              color: '#fff',
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}
                          >
                            Size
                          </Text>
                          {Object.keys(
                            measurementChart[Object.keys(measurementChart)[0]] || {}
                          ).map((measurement) => (
                            <Text
                              key={measurement}
                              style={{ flex: 1, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
                            >
                              {measurement}
                            </Text>
                          ))}
                        </View>
                        {/* Chart Rows */}
                        {Object.entries(measurementChart).map(([sizeName, measurements]) => (
                          <View
                            key={sizeName}
                            style={{
                              flexDirection: 'row',
                              borderBottomWidth: 1,
                              borderBottomColor: '#4E4E4E',
                              padding: 10,
                            }}
                          >
                            <Text style={{ flex: 1, color: '#fff', textAlign: 'center' }}>
                              {sizeName}
                            </Text>
                            {Object.values(measurements).map((value, index) => (
                              <Text
                                key={index}
                                style={{ flex: 1, color: '#ccc', textAlign: 'center' }}
                              >
                                {value}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Shop info */}
                    <View style={{ flexDirection: 'column', gap: 10, marginBottom: 200 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Shop:</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: shopDetails.logo }}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            marginRight: 10,
                            backgroundColor: '#ccc',
                          }}
                        />
                        <Text style={{ fontSize: 18, color: '#fff' }}>{shopDetails.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              }
            />

            {/* Bottom bar: "Add to Cart" */}
            <View style={styles.stickyButtonContainer}>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>

            {/* Reservation warning if stock <= 5 */}
            <Actionsheet isOpen={showReserveWarning} onClose={() => setShowReserveWarning(false)}>
              <Actionsheet.Content style={{ backgroundColor: '#191919' }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    marginBottom: 10,
                    textAlign: 'center'
                  }}
                >
                  The selected size has low stock (5 or fewer).
                  If you proceed, it will be reserved once you check out.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    { backgroundColor: '#fff', marginTop: 5, width: '100%' },
                  ]}
                  onPress={async () => {
                    setShowReserveWarning(false);
                    if (pendingCartValues) {
                      try {
                        await handleAddToCart(pendingCartValues);
                        animateAddToCart(pendingCartValues);
                        toast.show({
                          description: 'Item reserved to cart.',
                          duration: 3000,
                          placement: 'top',
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#191919',
                      fontSize: 16,
                      fontWeight: '400',
                      textAlign: 'center'
                    }}
                  >
                    Proceed Anyway
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    { backgroundColor: '#555', marginTop: 5, width: '100%' },
                  ]}
                  onPress={() => {
                    setShowReserveWarning(false);
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: '400',
                      textAlign: 'center'
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Actionsheet.Content>
            </Actionsheet>
          </View>
        )}
      </Formik>
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlayButtonsContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 100,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  cartButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#191919',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 50,
    zIndex: 10,
  },
  addToCartButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#191919', fontSize: 16, fontWeight: '400' },
  sizeBox: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    backgroundColor: '#4E4E4E',
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { color: '#fff', fontSize: 18 },
  quantityText: { marginHorizontal: 20, fontSize: 16, color: '#fff' },
  errorText: { color: 'red', marginTop: 5 },
  flyingImage: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 200,
  },
});

export default ProductViewScreen;
