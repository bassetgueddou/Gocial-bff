import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";// Définition des noms d'écrans dans le Stack.Navigator

type PremiumProps = {
    onPress: () => void;
};

const Premium: React.FC<PremiumProps> = ({ onPress }) => {

    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient
                colors={["#828799", "#626674", "#2B2D33"]}
                locations={[0.32, 0.56, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }} // Dégradé horizontal
                style={{
                    height: 60,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center", // Centre le contenu horizontalement
                    paddingHorizontal: 10,
                }}
            >
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                        Passe à Gosial Premium
                    </Text>
                    <Text style={{ color: "white", fontSize: 14 }}>
                        Découvre quand tes messages ont été vus
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default Premium;
