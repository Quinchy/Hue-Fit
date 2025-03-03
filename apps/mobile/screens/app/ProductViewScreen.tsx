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
import { ShoppingCart, ArrowLeft, Camera, Cpu, Loader2 } from 'lucide-react-native';
import { Actionsheet, useToast } from 'native-base';
import { EXPO_PUBLIC_API_URL } from '@env';
import { useTheme, applyOpacity } from '../../providers/ThemeProvider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const validationSchema = Yup.object().shape({
  selectedVariant: Yup.object().required('Variant is required'),
  selectedSize: Yup.object().required('Size is required'),
  quantity: Yup.number().min(1, 'Minimum quantity is 1').required('Quantity is required'),
});

const ProductViewScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // Log route parameters when the screen loads
  useEffect(() => {
    console.log("ProductViewScreen route params:", route.params);
  }, [route.params]);
  
  const { productId, recommendedVariantId, recommendedColor } = route.params;

  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const toast = useToast();

  const flyingAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyingScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [flyingImage, setFlyingImage] = useState(null);
  const [showFlyingImage, setShowFlyingImage] = useState(false);

  const [showReserveWarning, setShowReserveWarning] = useState(false);
  const [pendingCartValues, setPendingCartValues] = useState(null);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (addingToCart) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [addingToCart, spinValue]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/products/get-product-details`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }
      );
      if (!response.ok) throw new Error('Failed to fetch product details');
      const data = await response.json();
      setProductDetails(data);
      if (data.allVariants && data.allVariants.length > 0) {
        console.log("Recommended Color:", recommendedColor);
        // For each variant, check both top-level and nested color hexcode.
        data.allVariants.forEach(variant => {
          const variantHex = variant.hexcode || (variant.color && variant.color.hexcode);
          console.log(
            `Variant ID: ${variant.id} - Hexcode: ${variantHex} - Match: ${
              variantHex && recommendedColor && variantHex.toLowerCase() === recommendedColor.toLowerCase()
            }`
          );
        });
        let defaultVariant = null;
        if (recommendedColor) {
          defaultVariant = data.allVariants.find(v => {
            const hex = v.hexcode || (v.color && v.color.hexcode);
            return hex && hex.toLowerCase() === recommendedColor.toLowerCase();
          });
        }
        if (!defaultVariant && recommendedVariantId) {
          defaultVariant = data.allVariants.find(v => v.id === Number(recommendedVariantId));
        }
        if (!defaultVariant) {
          defaultVariant = data.allVariants[0];
        }
        setSelectedVariant(defaultVariant);
      }
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

  const { parentProduct, allVariants, measurementChart } = productDetails;
  const shopDetails = parentProduct.shop;

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
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/cart/add-to-cart`, {
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

  const checkSizeStock = (size) => {
    if (!size) return false;
    return size.quantity <= 5;
  };

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
            setShowReserveWarning(true);
            setPendingCartValues(values);
          } else {
            try {
              setAddingToCart(true);
              await handleAddToCart(values);
              animateAddToCart(values);
              toast.show({
                description: 'Item added to cart.',
                duration: 3000,
                placement: 'top',
              });
            } catch (error) {
              console.error(error);
            } finally {
              setAddingToCart(false);
            }
          }
        }}
        enableReinitialize
      >
        {({ handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.container}>
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
            <View style={styles.overlayButtonsContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft color={theme.colors.white} size={24} />
              </TouchableOpacity>
              <View style={styles.topRightButtons}>
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    { marginLeft: 10 },
                    !values.selectedVariant?.pngClotheURL && { opacity: 0.5 }
                  ]}
                  onPress={() => {
                    if (values.selectedVariant?.pngClotheURL) {
                      navigation.navigate('VirtualFitting', {
                        pngClotheURL: values.selectedVariant.pngClotheURL,
                        type: parentProduct?.typeName ?? '',
                        tag: parentProduct?.tagName ?? '',
                      });
                    }
                  }}
                  disabled={!values.selectedVariant?.pngClotheURL}
                >
                  <Camera color={theme.colors.white} size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    !values.selectedVariant?.pngClotheURL && { opacity: 0.5 }
                  ]}
                  onPress={() => {
                    if (values.selectedVariant?.pngClotheURL) {
                      navigation.navigate('AiTryOn', {
                        pngClotheURL: values.selectedVariant.pngClotheURL,
                        variantImage: values.selectedVariant.images[0],
                        type: parentProduct?.typeName ?? '',
                        tag: parentProduct?.tagName ?? '',
                      });
                    }
                  }}
                  disabled={!values.selectedVariant?.pngClotheURL}
                >
                  <Cpu color={theme.colors.white} size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => navigation.navigate('Cart', { fromProduct: true })}
                >
                  <ShoppingCart color={theme.colors.white} size={24} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={['placeholder']}
              renderItem={() => null}
              ListHeaderComponent={
                <View style={{ flex: 1, backgroundColor: theme.colors.dark }}>
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
                              backgroundColor: theme.colors.greyWhite,
                            }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    />
                  )}
                  {values.selectedVariant && (
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>PHP </Text>
                      <Text style={styles.priceValue}>
                        {values.selectedVariant.price}
                      </Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <View style={styles.productTitleContainer}>
                      <Text style={styles.productTitle}>
                        {parentProduct?.name || 'Product Name'}
                      </Text>
                      <Text style={styles.productDescription}>
                        {parentProduct?.description || 'No description available.'}
                      </Text>
                    </View>
                    <View style={styles.variantContainer}>
                      <Text style={styles.sectionTitle}>Colors:</Text>
                      <FlatList
                        data={allVariants}
                        horizontal
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.variantButton,
                              {
                                backgroundColor:
                                  values.selectedVariant?.id === item.id
                                    ? theme.colors.white
                                    : theme.colors.grey,
                              },
                            ]}
                            onPress={() => {
                              setFieldValue('selectedVariant', item);
                              setSelectedVariant(item);
                              setFieldValue('selectedSize', null);
                              setSelectedSize(null);
                              setQuantity(1);
                              setFieldValue('quantity', 1);
                            }}
                          >
                            <Text style={{ color: theme.colors.dark }}>
                              {item.color.name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                      {errors.selectedVariant && touched.selectedVariant && (
                        <Text style={styles.errorText}>{errors.selectedVariant}</Text>
                      )}
                    </View>
                    {values.selectedVariant && (
                      <View style={styles.sizeContainer}>
                        <Text style={styles.sectionTitle}>
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
                                    backgroundColor: isSelected
                                      ? theme.colors.white
                                      : theme.colors.grey,
                                  },
                                ]}
                                onPress={() => {
                                  setFieldValue('selectedSize', size);
                                  setSelectedSize(size);
                                  setQuantity(1);
                                  setFieldValue('quantity', 1);
                                }}
                              >
                                <Text style={{ color: theme.colors.dark }}>
                                  {size.abbreviation}
                                </Text>
                              </TouchableOpacity>
                            );
                          }}
                        />
                        {errors.selectedSize && touched.selectedSize && (
                          <Text style={styles.errorText}>{errors.selectedSize}</Text>
                        )}
                        {values.selectedSize && (
                          <Text style={styles.availableText}>
                            {values.selectedSize.quantity} pieces available
                          </Text>
                        )}
                      </View>
                    )}
                    <View style={styles.quantitySection}>
                      <Text style={styles.sectionTitle}>
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
                    <View style={styles.sizeChartSection}>
                      <Text style={styles.sectionTitle}>
                        Size Chart:
                      </Text>
                      <View style={styles.sizeChartContainer}>
                        <View style={styles.chartHeaderRow}>
                          <Text style={styles.chartHeaderText}>
                            Size
                          </Text>
                          {Object.keys(
                            measurementChart[Object.keys(measurementChart)[0]] || {}
                          ).map((measurement) => (
                            <Text
                              key={measurement}
                              style={styles.chartHeaderText}
                            >
                              {measurement}
                            </Text>
                          ))}
                        </View>
                        {Object.entries(measurementChart).map(([sizeName, measurements]) => (
                          <View
                            key={sizeName}
                            style={styles.chartRow}
                          >
                            <Text style={styles.chartRowText}>
                              {sizeName}
                            </Text>
                            {Object.values(measurements).map((value, index) => (
                              <Text
                                key={index}
                                style={styles.chartRowValue}
                              >
                                {value}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={styles.shopInfoSection}>
                      <Text style={styles.sectionTitle}>Shop:</Text>
                      <View style={styles.shopContainer}>
                        <Image
                          source={{ uri: shopDetails.logo }}
                          style={styles.shopLogo}
                        />
                        <Text style={styles.shopName}>{shopDetails.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              }
            />
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  addingToCart && { opacity: 0.7 }
                ]}
                onPress={handleSubmit}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Loader2 size={24} color={theme.colors.dark} style={{ marginRight: 8 }} />
                    </Animated.View>
                    <Text style={styles.buttonText}>Adding to Cart...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ShoppingCart color={theme.colors.dark} size={24} style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Add to Cart</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Actionsheet isOpen={showReserveWarning} onClose={() => setShowReserveWarning(false)}>
              <Actionsheet.Content style={styles.actionsheetContent}>
                <Text style={styles.actionsheetText}>
                  The selected size has low stock (5 or fewer).
                  If you proceed, it will be reserved once you check out.
                </Text>
                <TouchableOpacity
                  style={[styles.addToCartButton, styles.proceedButton]}
                  onPress={async () => {
                    setShowReserveWarning(false);
                    if (pendingCartValues) {
                      try {
                        setAddingToCart(true);
                        await handleAddToCart(pendingCartValues);
                        animateAddToCart(pendingCartValues);
                        toast.show({
                          description: 'Item reserved to cart.',
                          duration: 3000,
                          placement: 'top',
                        });
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setAddingToCart(false);
                      }
                    }
                  }}
                >
                  <Text style={styles.proceedButtonText}>
                    Proceed Anyway
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addToCartButton, styles.cancelButton]}
                  onPress={() => {
                    setShowReserveWarning(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>
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

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.dark },
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
    backgroundColor: applyOpacity(theme.colors.black, 0.5),
    padding: 10,
    borderRadius: 25,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartButton: {
    backgroundColor: applyOpacity(theme.colors.black, 0.5),
    padding: 10,
    borderRadius: 25,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  addToCartButton: {
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: theme.colors.dark, fontSize: 16, fontWeight: '400' },
  priceContainer: { flexDirection: 'row', padding: 10 },
  priceLabel: { fontSize: 24, color: theme.colors.white, fontWeight: '300' },
  priceValue: { fontSize: 24, color: theme.colors.white, fontWeight: '600' },
  productInfo: { paddingHorizontal: 10, gap: 20 },
  productTitleContainer: { flexDirection: 'column', gap: 10 },
  productTitle: { fontSize: 16, color: theme.colors.white, fontWeight: '600' },
  productDescription: { fontSize: 16, color: applyOpacity(theme.colors.white, 0.8), fontWeight: '300' },
  variantContainer: { flexDirection: 'column', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.white },
  variantButton: { padding: 10, borderRadius: 5, marginRight: 10 },
  errorText: { color: 'red', marginTop: 5 },
  availableText: { fontSize: 14, color: applyOpacity(theme.colors.white, 0.8), marginTop: 10 },
  sizeContainer: { flexDirection: 'column', gap: 10 },
  sizeBox: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantitySection: { flexDirection: 'column', gap: 10 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    backgroundColor: theme.colors.grey,
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { color: theme.colors.white, fontSize: 18 },
  quantityText: { marginHorizontal: 20, fontSize: 16, color: theme.colors.white },
  sizeChartSection: { flexDirection: 'column', gap: 10 },
  sizeChartContainer: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderRadius: 5,
    overflow: 'hidden',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.darkGrey,
    padding: 10,
  },
  chartHeaderText: {
    flex: 1,
    color: theme.colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chartRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
    padding: 10,
  },
  chartRowText: { flex: 1, color: theme.colors.white, textAlign: 'center' },
  chartRowValue: { flex: 1, color: applyOpacity(theme.colors.white, 0.8), textAlign: 'center' },
  shopInfoSection: { flexDirection: 'column', gap: 10, marginBottom: 200 },
  shopContainer: { flexDirection: 'row', alignItems: 'center' },
  shopLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: theme.colors.greyWhite,
  },
  shopName: { fontSize: 18, color: theme.colors.white },
  flyingImage: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 200,
  },
  actionsheetContent: { backgroundColor: theme.colors.dark, width: '100%' },
  actionsheetText: { color: theme.colors.white, fontSize: 18, marginBottom: 10, textAlign: 'center' },
  proceedButton: { backgroundColor: theme.colors.white, marginTop: 5, width: '100%' },
  proceedButtonText: { color: theme.colors.dark, fontSize: 16, fontWeight: '400', textAlign: 'center' },
  cancelButton: { backgroundColor: theme.colors.grey, marginTop: 5, width: '100%' },
  cancelButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: '400', textAlign: 'center' },
});

export default ProductViewScreen;
