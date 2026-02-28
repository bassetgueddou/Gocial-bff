import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../src/contexts/AuthContext";


import BottomTabNavigator from "./BottomTabNavigator";
{/* Register */ }
import RegisterPerson from "../screens/Register/RegisterPerson";
import Login from "../screens/Register/Login";
import Register from "../screens/Register/Register";
import RegisterProAsso from "../screens/Register/RegisterProAsso";
import AddProfilePhotoProAsso from "../screens/Register/AddProfilePhotoProAsso";
import AddProfilePhotoPerson from "../screens/Register/AddProfilePhotoPerson";
import NotifVerifyProfile from "../screens/Notification/NotifVerifyProfile";
import ClickNotifVerifyProfile from "../screens/Register/ClickNotifVerifyProfile";
{/* Parameter */ }
import GeneralParameter from "../screens/Parameter/GeneralParameter";
import AccountPrivacyPerson from "../screens/Parameter/AccountPrivacyPerson";
import AccountPrivacyProAsso from "../screens/Parameter/AccountPrivacyProAsso";
import NotificationsPerson from "../screens/Parameter/NotificationsPerson";
import NotificationsProAsso from "../screens/Parameter/NotificationsProAsso";
import EditLearnMore from "../screens/Parameter/EditLearnMore";
import EditSocialNetworks from "../screens/Parameter/EditSocialNetworks";
import EditAbout from "../screens/Parameter/EditAbout";
import EditIdentity from "../screens/Parameter/EditIdentity";
import ProfilPerson from "../screens/Parameter/ProfilPerson";
import ProfilPersonPreview from "../screens/Parameter/ProfilPersonPreview";
import ProfilAssoPreview from "../screens/Parameter/ProfilAssoPreview";
import ProfilAsso from "../screens/Parameter/ProfilAsso";
import ProfilPro from "../screens/Parameter/ProfilPro";
import ProfilProPreview from "../screens/Parameter/ProfilProPreview";
import MyInformations from "../screens/Parameter/MyInformations";
import ChangeEmail from "../screens/Parameter/ChangeEmail";
import ChangePassword from "../screens/Parameter/ChangePassword";
import ContactUs from "../screens/Parameter/ContactUs";
import FriendsSponsorship from "../screens/Parameter/FriendsSponsorship";
{/* Notification */ }
import HostEvaluation from "../screens/Notification/HostEvaluation";
import ParticipantEvaluation from "../screens/Notification/ParticipantEvaluation";
{/* Premium */ }
import PremiumOfferPerson from "../screens/Premium/PremiumOfferPerson";
import PremiumOfferProAsso from "../screens/Premium/PremiumOfferProAsso";
import GetPremiumPerson from "../screens/Premium/GetPremiumPerson";
import GetPremiumProAsso from "../screens/Premium/GetPremiumProAsso";
import GetPremiumPlusPerson from "../screens/Premium/GetPremiumPlusPerson";
import GetPremiumPlusProAsso from "../screens/Premium/GetPremiumPlusProAsso";
{/* Home */ }
import HomeMap from "../screens/Home/HomeMap";
import HomeVisio from "../screens/Home/HomeVisio";
import HomeReal from "../screens/Home/HomeReal";
import ActivityOverview from "../screens/Activity/ActivityOverview";
import HomeTopTabs from "./HomeTopTabs";
import ProfilProHome from "../screens/Home/ProfilProHome";
import ProfilAssoHome from "../screens/Home/ProfilAssoHome";
import ProfilPersonOverview from "../screens/Home/ProfilPersonOverview";
import ProfilProAdd from "../screens/Home/ProfilProAdd";
import ProfilAssoAdd from "../screens/Home/ProfilAssoAdd";
{/* Activity */ }
import ModifActivityOverview from "../screens/Activity/ModifActivityOverview";
import ReportActivity from "../screens/Activity/ReportActivity";
import MyActivityOverview from "../screens/Activity/MyActivityOverview";
import ParticipationHostTopTabs from "./ParticipationHostTopTabs";
import ParticipationTopTabs from "./ParticipationTopTabs";
{/* Plus */ }
import CAVisioInformation from "../screens/Plus/Visio/CAVisioInformation";
import CAVisioRestriction from "../screens/Plus/Visio/CAVisioRestriction";
import CANumberParticipants from "../screens/Plus/CaNumberParticipants";
import CATitle from "../screens/Plus/CaTitle";
import CAVisioPreview from "../screens/Plus/Visio/CAVisioPreview";
import CARealPreview from "../screens/Plus/Real/CARealPreview";
import CARealInformation from "../screens/Plus/Real/CARealInformation";
import CARealRestriction from "../screens/Plus/Real/CARealRestriction";
import CreateActivity from "../screens/Plus/CreateActivity";


const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Stack.Navigator>
            {!isAuthenticated ? (
                // ── Auth screens (unauthenticated) ──
                <>
                    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                    <Stack.Screen name="RegisterPerson" component={RegisterPerson} options={{ headerShown: false }} />
                    <Stack.Screen name="RegisterProAsso" component={RegisterProAsso} options={{ headerShown: false }} />
                    <Stack.Screen name="AddProfilePhotoProAsso" component={AddProfilePhotoProAsso} options={{ headerShown: false }} />
                    <Stack.Screen name="AddProfilePhotoPerson" component={AddProfilePhotoPerson} options={{ headerShown: false }} />
                    <Stack.Screen name="ClickNotifVerifyProfile" component={ClickNotifVerifyProfile} options={{ headerShown: false }} />
                    <Stack.Screen name="NotifVerifyProfile" component={NotifVerifyProfile} options={{ headerShown: false }} />
                </>
            ) : (
                // ── Main app screens (authenticated) ──
                <>
                    {/* Navigation principale */}
                    <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />

            {/* Autres écrans qui ne sont pas dans les Tabs */}

            {/* Plus */}
            <Stack.Screen name="CAVisioInformation" component={CAVisioInformation} options={{ headerShown: false }} />
            <Stack.Screen name="CAVisioRestriction" component={CAVisioRestriction} options={{ headerShown: false }} />
            <Stack.Screen name="CANumberParticipants" component={CANumberParticipants} options={{ headerShown: false }} />
            <Stack.Screen name="CATitle" component={CATitle} options={{ headerShown: false }} />
            <Stack.Screen name="CAVisioPreview" component={CAVisioPreview} options={{ headerShown: false }} />
            <Stack.Screen name="CARealPreview" component={CARealPreview} options={{ headerShown: false }} />
            <Stack.Screen name="CARealRestriction" component={CARealRestriction} options={{ headerShown: false }} />
            <Stack.Screen name="CARealInformation" component={CARealInformation} options={{ headerShown: false }} />
            <Stack.Screen name="CreateActivity" component={CreateActivity} options={{ headerShown: false }} />


            {/* Home */}
            <Stack.Screen name="HomeTopTabs" component={HomeTopTabs} options={{ headerShown: false }} />
            <Stack.Screen name="HomeReal" component={HomeReal} options={{ headerShown: false }} />
            <Stack.Screen name="HomeVisio" component={HomeVisio} options={{ headerShown: false }} />
            <Stack.Screen name="EditIdentity" component={EditIdentity} options={{ headerShown: false }} />
            <Stack.Screen name="HomeMap" component={HomeMap} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilProHome" component={ProfilProHome} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilAssoHome" component={ProfilAssoHome} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilPersonOverview" component={ProfilPersonOverview} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilProAdd" component={ProfilProAdd} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilAssoAdd" component={ProfilAssoAdd} options={{ headerShown: false }} />

            {/* Activity */}
            <Stack.Screen name="ParticipationHostTopTabs" component={ParticipationHostTopTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ParticipationTopTabs" component={ParticipationTopTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ActivityOverview" component={ActivityOverview} options={{ headerShown: false }} />
            <Stack.Screen name="ModifActivityOverview" component={ModifActivityOverview} options={{ headerShown: false }} />
            <Stack.Screen name="ReportActivity" component={ReportActivity} options={{ headerShown: false }} />
            <Stack.Screen name="MyActivityOverview" component={MyActivityOverview} options={{ headerShown: false }} />

            {/* Premium */}
            <Stack.Screen name="GetPremiumProAsso" component={GetPremiumProAsso} options={{ headerShown: false }} />
            <Stack.Screen name="GetPremiumPlusProAsso" component={GetPremiumPlusProAsso} options={{ headerShown: false }} />
            <Stack.Screen name="GetPremiumPlusPerson" component={GetPremiumPlusPerson} options={{ headerShown: false }} />
            <Stack.Screen name="GetPremiumPerson" component={GetPremiumPerson} options={{ headerShown: false }} />
            <Stack.Screen name="PremiumOfferPerson" component={PremiumOfferPerson} options={{ headerShown: false }} />
            <Stack.Screen name="PremiumOfferProAsso" component={PremiumOfferProAsso} options={{ headerShown: false }} />

            {/* Notification */}
            <Stack.Screen name="ParticipantEvaluation" component={ParticipantEvaluation} options={{ headerShown: false }} />
            <Stack.Screen name="HostEvaluation" component={HostEvaluation} options={{ headerShown: false }} />


            {/* Parameter */}
            <Stack.Screen name="ProfilProPreview" component={ProfilProPreview} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilPro" component={ProfilPro} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilAsso" component={ProfilAsso} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilAssoPreview" component={ProfilAssoPreview} options={{ headerShown: false }} />
            <Stack.Screen name="GeneralParameter" component={GeneralParameter} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilPersonPreview" component={ProfilPersonPreview} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilPerson" component={ProfilPerson} options={{ headerShown: false }} />
            <Stack.Screen name="EditSocialNetworks" component={EditSocialNetworks} options={{ headerShown: false }} />
            <Stack.Screen name="EditAbout" component={EditAbout} options={{ headerShown: false }} />
            <Stack.Screen name="EditLearnMore" component={EditLearnMore} options={{ headerShown: false }} />
            <Stack.Screen name="AccountPrivacyProAsso" component={AccountPrivacyProAsso} options={{ headerShown: false }} />
            <Stack.Screen name="AccountPrivacyPerson" component={AccountPrivacyPerson} options={{ headerShown: false }} />
            <Stack.Screen name="NotificationsPerson" component={NotificationsPerson} options={{ headerShown: false }} />
            <Stack.Screen name="NotificationsProAsso" component={NotificationsProAsso} options={{ headerShown: false }} />
            <Stack.Screen name="MyInformations" component={MyInformations} options={{ headerShown: false }} />
            <Stack.Screen name="ChangeEmail" component={ChangeEmail} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
            <Stack.Screen name="ContactUs" component={ContactUs} options={{ headerShown: false }} />
            <Stack.Screen name="FriendsSponsorship" component={FriendsSponsorship} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;