// screens/ProductViewScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  TextInput,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundProvider from "../../providers/BackgroundProvider";
import LoadingSpinner from "../../components/Loading";
import Alert, { AlertStatus } from "../../components/Alert";
import {
  ShoppingCart,
  ArrowLeft,
  Camera,
  Cpu,
  Loader,
  TriangleAlert,
} from "lucide-react-native";
import { Actionsheet, HStack } from "native-base";
import { EXPO_PUBLIC_API_URL } from "@env";
import { colors, applyOpacity } from "../../constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const validationSchema = Yup.object().shape({
  selectedVariant: Yup.object().required("Variant is required"),
  selectedSize: Yup.object().required("Size is required"),
  quantity: Yup.number()
    .min(1, "Minimum quantity is 1")
    .required("Quantity is required"),
});

const ProductViewScreen = ({ route, navigation }) => {
  const styles = getStyles();
  const { productId, recommendedVariantId, recommendedColor } = route.params;

  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    status: AlertStatus;
  } | null>(null);

  const flyingAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyingScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [flyingImage, setFlyingImage] = useState<string | null>(null);
  const [showFlyingImage, setShowFlyingImage] = useState(false);

  const [showReserveWarning, setShowReserveWarning] = useState(false);
  const [pendingCartValues, setPendingCartValues] = useState<any>(null);

  const SpinningLoader = ({ size, color, style }) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, [spinValue]);
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });
    return (
      <Animated.View style={[{ transform: [{ rotate: spin }] }, style]}>
        <Loader size={size} color={color} />
      </Animated.View>
    );
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/products/get-product-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setProductDetails(data);

      const { allVariants } = data;
      let defaultVariant = allVariants[0];
      if (recommendedColor) {
        const match = allVariants.find((v: any) => {
          const hex = v.hexcode || v.color?.hexcode;
          return (
            hex &&
            hex.toLowerCase() === (recommendedColor as string).toLowerCase()
          );
        });
        if (match) defaultVariant = match;
      }
      if (!defaultVariant && recommendedVariantId) {
        const byId = allVariants.find(
          (v: any) => v.id === Number(recommendedVariantId)
        );
        if (byId) defaultVariant = byId;
      }
      setSelectedVariant(defaultVariant);
    } catch (err) {
      console.error(err);
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

  const handleAddToCart = async (values: any) => {
    const userStr = await AsyncStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).id : null;
    if (!userId) {
      console.error("No user ID");
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
    const res = await fetch(
      `${EXPO_PUBLIC_API_URL}/api/mobile/cart/add-to-cart`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error("Add to cart failed");
    return res.json();
  };

  const animateAddToCart = (values: any) => {
    if (!values.selectedVariant?.images?.[0]) return;
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
      }),
    ]).start(() => setShowFlyingImage(false));
  };

  const checkSizeStock = (size: any) => (size ? size.quantity <= 5 : false);

  return (
    <BackgroundProvider>
      {alertConfig && (
        <Alert
          message={alertConfig.message}
          status={alertConfig.status}
          onClose={() => setAlertConfig(null)}
        />
      )}
      <Formik
        initialValues={{
          productId,
          shopId: shopDetails.id,
          selectedVariant,
          selectedSize,
          quantity,
        }}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values) => {
          const low = checkSizeStock(values.selectedSize);
          if (low) {
            setPendingCartValues(values);
            setShowReserveWarning(true);
          } else {
            try {
              setAddingToCart(true);
              await handleAddToCart(values);
              animateAddToCart(values);
              setAlertConfig({
                message: "Item added to cart.",
                status: "success",
              });
            } catch {
              setAlertConfig({
                message: "Failed to add to cart.",
                status: "error",
              });
            } finally {
              setAddingToCart(false);
            }
          }
        }}
      >
        {({ handleSubmit, setFieldValue, values, errors, touched }) => {
          const maxQty =
            values.selectedSize?.quantity > 5
              ? values.selectedSize.quantity - 5
              : Infinity;
          return (
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

              {/* Top overlay buttons */}
              <View style={styles.overlayButtonsContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <ArrowLeft color={colors.white} size={24} />
                </TouchableOpacity>
                <View style={styles.topRightButtons}>
                  <TouchableOpacity
                    style={[
                      styles.backButton,
                      !values.selectedVariant?.pngClotheURL && { opacity: 0.5 },
                    ]}
                    disabled={!values.selectedVariant?.pngClotheURL}
                    onPress={() =>
                      navigation.navigate("VirtualFitting", {
                        pngClotheURL: values.selectedVariant.pngClotheURL,
                        type: parentProduct.typeName,
                        tag: parentProduct.tagName,
                      })
                    }
                  >
                    <Camera color={colors.white} size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.backButton,
                      !values.selectedVariant?.pngClotheURL && { opacity: 0.5 },
                    ]}
                    disabled={!values.selectedVariant?.pngClotheURL}
                    onPress={() =>
                      navigation.navigate("AiTryOn", {
                        pngClotheURL: values.selectedVariant.pngClotheURL,
                        variantImage: values.selectedVariant.images[0],
                        type: parentProduct.typeName,
                        tag: parentProduct.tagName,
                      })
                    }
                  >
                    <Cpu color={colors.white} size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() =>
                      navigation.navigate("Cart", { fromProduct: true })
                    }
                  >
                    <ShoppingCart color={colors.white} size={24} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Main scroll/content */}
              <FlatList
                data={["_"]}
                renderItem={() => null}
                keyExtractor={(_, i) => String(i)}
                ListHeaderComponent={
                  <View style={{ backgroundColor: colors.dark, flex: 1 }}>
                    {/* Images carousel */}
                    {values.selectedVariant && (
                      <FlatList
                        data={values.selectedVariant.images}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        keyExtractor={(_, i) =>
                          `${values.selectedVariant.id}-${i}`
                        }
                        renderItem={({ item }) => (
                          <Image
                            source={{ uri: item }}
                            style={{
                              width: screenWidth,
                              height: 500,
                              backgroundColor: colors.greyWhite,
                            }}
                            resizeMode="cover"
                          />
                        )}
                      />
                    )}

                    {/* Price */}
                    {values.selectedVariant && (
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>PHP </Text>
                        <Text style={styles.priceValue}>
                          {values.selectedVariant.price}
                        </Text>
                      </View>
                    )}

                    {/* Details */}
                    <View style={styles.productInfo}>
                      {/* Title & desc */}
                      <View style={styles.productTitleContainer}>
                        <Text style={styles.productTitle}>
                          {parentProduct.name}
                        </Text>
                        <Text style={styles.productDescription}>
                          {parentProduct.description}
                        </Text>
                      </View>

                      {/* Color variants */}
                      <View style={styles.variantContainer}>
                        <Text style={styles.sectionTitle}>Colors:</Text>
                        <FlatList
                          data={allVariants}
                          horizontal
                          keyExtractor={(v) => String(v.id)}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={[
                                styles.variantButton,
                                {
                                  backgroundColor:
                                    values.selectedVariant?.id === item.id
                                      ? colors.white
                                      : colors.grey,
                                },
                              ]}
                              onPress={() => {
                                setFieldValue("selectedVariant", item);
                                setSelectedVariant(item);
                                setSelectedSize(null);
                                setFieldValue("selectedSize", null);
                                setQuantity(1);
                                setFieldValue("quantity", 1);
                              }}
                            >
                              <Text style={{ color: colors.dark }}>
                                {item.color.name}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                        {errors.selectedVariant && touched.selectedVariant && (
                          <Text style={styles.errorText}>
                            {errors.selectedVariant}
                          </Text>
                        )}
                      </View>

                      {/* Sizes */}
                      {values.selectedVariant && (
                        <View style={styles.sizeContainer}>
                          <Text style={styles.sectionTitle}>Sizes:</Text>
                          <FlatList
                            data={values.selectedVariant.sizes}
                            horizontal
                            keyExtractor={(_, idx) => `size-${idx}`}
                            renderItem={({ item }) => {
                              const isSel =
                                values.selectedSize?.abbreviation ===
                                item.abbreviation;
                              return (
                                <TouchableOpacity
                                  style={[
                                    styles.sizeBox,
                                    {
                                      backgroundColor: isSel
                                        ? colors.white
                                        : colors.grey,
                                    },
                                  ]}
                                  onPress={() => {
                                    setFieldValue("selectedSize", item);
                                    setSelectedSize(item);
                                    setQuantity(1);
                                    setFieldValue("quantity", 1);
                                  }}
                                >
                                  <Text style={{ color: colors.dark }}>
                                    {item.abbreviation}
                                  </Text>
                                </TouchableOpacity>
                              );
                            }}
                          />
                          {errors.selectedSize && touched.selectedSize && (
                            <HStack space={1} alignItems={"center"}>
                              <TriangleAlert size={16} color={colors.warning} />
                              <Text style={styles.errorText}>
                                {errors.selectedSize}
                              </Text>
                            </HStack>
                          )}
                          {values.selectedSize &&
                            (values.selectedSize.quantity <= 5 ? (
                              <HStack alignItems="center">
                                <TriangleAlert
                                  size={16}
                                  color={colors.warning}
                                />
                                <Text
                                  style={[
                                    styles.availableText,
                                    { color: colors.warning, marginLeft: 4 },
                                  ]}
                                >
                                  {`Only ${values.selectedSize.quantity} pieces remaining!`}
                                </Text>
                              </HStack>
                            ) : (
                              <Text style={styles.availableText}>
                                {`${values.selectedSize.quantity} pieces available`}
                              </Text>
                            ))}
                        </View>
                      )}

                      {/* Quantity picker */}
                      <View style={styles.quantitySection}>
                        <Text style={styles.sectionTitle}>Quantity:</Text>
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => {
                              if (quantity > 1) {
                                const n = Math.max(1, quantity - 1);
                                setQuantity(n);
                                setFieldValue("quantity", n);
                              }
                            }}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={styles.quantityText}
                            keyboardType="numeric"
                            value={String(values.quantity)}
                            onChangeText={(t) => {
                              const raw = parseInt(t, 10);
                              const n = isNaN(raw) ? 1 : raw;
                              if (n > maxQty) {
                                setAlertConfig({
                                  message:
                                    "You’ve reached the maximum quantity.",
                                  status: "info",
                                });
                              }
                              const clamped = Math.min(maxQty, Math.max(1, n));
                              setQuantity(clamped);
                              setFieldValue("quantity", clamped);
                            }}
                            onBlur={() => {
                              let clamped = values.quantity;
                              if (clamped < 1) clamped = 1;
                              if (clamped > maxQty) {
                                clamped = maxQty;
                                setAlertConfig({
                                  message:
                                    "You’ve reached the maximum quantity.",
                                  status: "info",
                                });
                              }
                              setQuantity(clamped);
                              setFieldValue("quantity", clamped);
                            }}
                          />
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => {
                              if (quantity >= maxQty) {
                                setAlertConfig({
                                  message:
                                    "You’ve reached the maximum quantity.",
                                  status: "info",
                                });
                              } else {
                                const n = Math.min(maxQty, quantity + 1);
                                setQuantity(n);
                                setFieldValue("quantity", n);
                              }
                            }}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        {errors.quantity && touched.quantity && (
                          <Text style={styles.errorText}>
                            {errors.quantity}
                          </Text>
                        )}
                      </View>

                      {/* Size chart */}
                      <View style={styles.sizeChartSection}>
                        <Text style={styles.sectionTitle}>Size Chart:</Text>
                        <View style={styles.sizeChartContainer}>
                          <View style={styles.chartHeaderRow}>
                            <Text style={styles.chartHeaderText}>Size</Text>
                            {Object.keys(
                              measurementChart[
                                Object.keys(measurementChart)[0]
                              ] || {}
                            ).map((m) => (
                              <Text key={m} style={styles.chartHeaderText}>
                                {m}
                              </Text>
                            ))}
                          </View>
                          {Object.entries(measurementChart).map(
                            ([sizeName, measures]) => (
                              <View key={sizeName} style={styles.chartRow}>
                                <Text style={styles.chartRowText}>
                                  {sizeName}
                                </Text>
                                {Object.values(measures).map((val, i) => (
                                  <Text key={i} style={styles.chartRowValue}>
                                    {val}
                                  </Text>
                                ))}
                              </View>
                            )
                          )}
                        </View>
                      </View>

                      {/* Shop info */}
                      <View style={styles.shopInfoSection}>
                        <Text style={styles.sectionTitle}>Shop:</Text>
                        <View style={styles.shopContainer}>
                          <Image
                            source={{ uri: shopDetails.logo }}
                            style={styles.shopLogo}
                          />
                          <Text style={styles.shopName}>
                            {shopDetails.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                }
              />

              {/* Add to cart button */}
              <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    addingToCart && { opacity: 0.7 },
                  ]}
                  onPress={handleSubmit as any}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <View style={styles.loaderRow}>
                      <SpinningLoader
                        size={24}
                        color={colors.dark}
                        style={styles.loaderMargin}
                      />
                      <Text style={styles.buttonText}>Adding to Cart...</Text>
                    </View>
                  ) : (
                    <View style={styles.loaderRow}>
                      <ShoppingCart
                        color={colors.dark}
                        size={24}
                        style={styles.loaderMargin}
                      />
                      <Text style={styles.buttonText}>Add to Cart</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Low-stock warning */}
              <Actionsheet
                isOpen={showReserveWarning}
                onClose={() => setShowReserveWarning(false)}
              >
                <Actionsheet.Content style={styles.actionsheetContent}>
                  <Text style={styles.actionsheetText}>
                    The selected size has low stock (5 or fewer). If you
                    proceed, it will be reserved once you check out.
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
                          setAlertConfig({
                            message: "Item reserved to cart.",
                            status: "info",
                          });
                        } catch {
                          setAlertConfig({
                            message: "Reservation failed.",
                            status: "error",
                          });
                        } finally {
                          setAddingToCart(false);
                        }
                      }
                    }}
                  >
                    <Text style={styles.proceedButtonText}>Proceed Anyway</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addToCartButton, styles.cancelButton]}
                    onPress={() => setShowReserveWarning(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </Actionsheet.Content>
              </Actionsheet>
            </View>
          );
        }}
      </Formik>
    </BackgroundProvider>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.dark },
    overlayButtonsContainer: {
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      zIndex: 100,
    },
    backButton: {
      backgroundColor: applyOpacity(colors.black, 0.5),
      padding: 10,
      borderRadius: 25,
    },
    topRightButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cartButton: {
      backgroundColor: applyOpacity(colors.black, 0.5),
      padding: 10,
      borderRadius: 25,
    },
    floatingButtonContainer: {
      position: "absolute",
      bottom: 50,
      left: 20,
      right: 20,
      alignItems: "center",
      zIndex: 10,
    },
    addToCartButton: {
      backgroundColor: colors.white,
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
    },
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    loaderMargin: {
      marginRight: 8,
    },
    buttonText: {
      color: colors.dark,
      fontSize: 16,
      fontWeight: "400",
    },
    priceContainer: { flexDirection: "row", padding: 10 },
    priceLabel: {
      fontSize: 24,
      color: colors.white,
      fontWeight: "300",
    },
    priceValue: {
      fontSize: 24,
      color: colors.white,
      fontWeight: "600",
    },
    productInfo: { paddingHorizontal: 10, gap: 20 },
    productTitleContainer: { flexDirection: "column", gap: 10 },
    productTitle: {
      fontSize: 16,
      color: colors.white,
      fontWeight: "600",
    },
    productDescription: {
      fontSize: 16,
      color: applyOpacity(colors.white, 0.8),
      fontWeight: "300",
    },
    variantContainer: { flexDirection: "column", gap: 10 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
    variantButton: { padding: 10, borderRadius: 5, marginRight: 10 },
    errorText: { color: colors.warning },
    availableText: {
      fontSize: 14,
      color: applyOpacity(colors.white, 0.8),
      marginTop: 2,
    },
    sizeContainer: { flexDirection: "column", gap: 10 },
    sizeBox: {
      padding: 10,
      borderRadius: 5,
      marginRight: 10,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    quantitySection: { flexDirection: "column", gap: 10 },
    quantityContainer: { flexDirection: "row", alignItems: "center" },
    quantityButton: {
      backgroundColor: colors.grey,
      borderRadius: 5,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    quantityButtonText: { color: colors.white, fontSize: 18 },
    quantityText: {
      marginHorizontal: 20,
      fontSize: 16,
      color: colors.white,
      textAlign: "center",
      minWidth: 40,
    },
    sizeChartSection: { flexDirection: "column", gap: 10 },
    sizeChartContainer: {
      borderWidth: 1,
      borderColor: colors.grey,
      borderRadius: 5,
      overflow: "hidden",
    },
    chartHeaderRow: {
      flexDirection: "row",
      backgroundColor: colors.darkGrey,
      padding: 10,
    },
    chartHeaderText: {
      flex: 1,
      color: colors.white,
      textAlign: "center",
      fontWeight: "bold",
    },
    chartRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      padding: 10,
    },
    chartRowText: { flex: 1, color: colors.white, textAlign: "center" },
    chartRowValue: {
      flex: 1,
      color: applyOpacity(colors.white, 0.8),
      textAlign: "center",
    },
    shopInfoSection: { flexDirection: "column", gap: 10, marginBottom: 200 },
    shopContainer: { flexDirection: "row", alignItems: "center" },
    shopLogo: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
      backgroundColor: colors.greyWhite,
    },
    shopName: { fontSize: 18, color: colors.white },
    flyingImage: {
      position: "absolute",
      width: 50,
      height: 50,
      zIndex: 200,
    },
    actionsheetContent: { backgroundColor: colors.dark, width: "100%" },
    actionsheetText: {
      color: colors.white,
      fontSize: 18,
      marginBottom: 10,
      textAlign: "center",
    },
    proceedButton: {
      backgroundColor: colors.white,
      marginTop: 5,
      width: "100%",
    },
    proceedButtonText: {
      color: colors.dark,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
    },
    cancelButton: {
      backgroundColor: colors.grey,
      marginTop: 5,
      width: "100%",
    },
    cancelButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
    },
  });

export default ProductViewScreen;
