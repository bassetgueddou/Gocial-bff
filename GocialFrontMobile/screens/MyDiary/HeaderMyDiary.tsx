import { View, Text, Image, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeContext";
import LinearGradient from "react-native-linear-gradient";
import React, { useState } from "react";
import MessageModal from "../Message/MessageModal";
import FilterDiaryModal from "./FilterDiaryModal";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../src/contexts/AuthContext";

type RootStackParamList = {
    GeneralParameter: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

type DiaryFilter = "all" | "participations" | "liked";

interface HeaderMyDiaryProps {
    title: string;
    filter?: DiaryFilter;
    onFilterChange?: (f: DiaryFilter) => void;
}

const HeaderMyDiary: React.FC<HeaderMyDiaryProps> = ({ title, filter = "all", onFilterChange }) => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();

    const [modalMessageVisible, setModalMessageVisible] = useState(false);
    const [modalFilterDiaryVisible, setModalFilterDiaryVisible] = useState(false);

    const initials = user
        ? `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase() || "?"
        : "?";

    return (
        <LinearGradient
            colors={["#004C82", "#065C98"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView>
                <MessageModal visible={modalMessageVisible} onClose={() => setModalMessageVisible(false)} />
                <FilterDiaryModal
                    visible={modalFilterDiaryVisible}
                    onClose={() => setModalFilterDiaryVisible(false)}
                    filter={filter}
                    onFilterChange={(f) => {
                        if (onFilterChange) onFilterChange(f);
                    }}
                />

                <View className="flex-row items-center justify-between p-4">
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} className="w-12 h-12 rounded-full" />
                        ) : (
                            <Text className="text-white font-bold text-base">{initials}</Text>
                        )}
                    </TouchableOpacity>

                    <Text className="text-white text-lg font-semibold">{title}</Text>

                    <TouchableOpacity onPress={() => setModalMessageVisible(true)}>
                        <Image source={require("../../img/message.png")} className="h-8 w-8" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default HeaderMyDiary;
