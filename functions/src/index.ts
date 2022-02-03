import * as functions from 'firebase-functions'
import admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);


export const onMessageUpdate = functions.database
    .ref('6ZH8YQGNhnHzwO3Q_DEBUG/users/{userId}')
    .onUpdate((change, context) => {
        const before = change.before.val()
        const after = change.after.val()

        var isNameChanged: Boolean = false
        var isProfileChanged: Boolean = false
       


        if (before.name === after.name && before.profilePictureUrl === after.profilePictureUrl) {
            return
        }


        if (before.name !== after.name) {
            isNameChanged = true
        }

        if (before.profilePictureUrl !== after.profilePictureUrl) {
            isProfileChanged = true
        }  
        
        const afterId = after.id

        const ref = change.after.ref.root.child("6ZH8YQGNhnHzwO3Q_DEBUG/recent_chat/");

        const promises = ref.once('value').then(snapshot => {

            snapshot.forEach((chat => {

                const refInner = ref.child("/" + chat.key + "/");

                refInner.once('value').then(snapshotInner => {

                    const updates: { [index: string]: any } = {};

                    snapshotInner.forEach((chatInner => {

                        if (chatInner.key !== null) {

                            const test: String = chatInner.key
                            console.log('chat Inner key' + test)

                            if (test.indexOf(afterId + '') >= 0) {

                                if (isProfileChanged) {
                                    updates[chatInner.key + '/profilePictureUrl'] = after.profilePictureUrl;
                                }
                                if (isNameChanged) {
                                    updates[chatInner.key + '/name'] = after.name;
                                }
                                // if (isStatusChanged) {
                                //     updates[chatInner.key + '/isOnline'] = after.isOnline;
                                // }

                            }
                        }

                    }))

                    refInner.update(updates).then(() => {
                        console.log('Successfull')
                    })
                        .catch(error => {
                            console.log('Error')
                        })

                }).catch(error => {
                    console.log('error occured.')
                })

            }))

        }).catch(error => {
            console.log('error occured.')
        })
        return promises
    })

export const onMessageAdded = functions.database

    .ref('6ZH8YQGNhnHzwO3Q_DEBUG/chat/{whichNodes}/{chatId}').onCreate((snapShot, context) => {

        const messageDataForUserOne = snapShot.val()
        const messageDataForUserTwo = snapShot.val()

        let userDeviceToken: string
        let nameToNotify: string
        let profileToNotify:string

        let isBadgeAddedFirst = false
        let isBadgeAddedSecond = false
        // let user2DeviceToken: string



        const whichNodes = context.params.whichNodes


        const test: String[] = whichNodes.trim().split('_', 2);

        let updates = []


        console.log('user/' + test[1] + '/')
        const refUserInfoSecond = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/users/' + test[0] + '/').once('value').then(model => {
            messageDataForUserTwo.name = model.val().name
            messageDataForUserTwo.profilePictureUrl = model.val().profilePictureUrl

            if (messageDataForUserTwo.receiverId + '' === test[0]) {
                userDeviceToken = model.val().deviceToken

                let currentChat = model.val().current_chat
                try {
                    const current_chat_split: String[] = currentChat.trim().split('_', 2);
                    if (current_chat_split.indexOf(test[1]) >= 0) {
                        isBadgeAddedFirst = false
                          } else {
                        isBadgeAddedFirst = true
                       }
                } catch (exception) {
                    console.log(exception)
                     isBadgeAddedFirst = true

                }

            } else {
                nameToNotify = model.val().name
                profileToNotify=model.val().profilePictureUrl
                isBadgeAddedFirst = false
            }

        })
        const refUserInfoFirst = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/users/' + test[1] + '/').once('value').then(UserSecondData => {
            messageDataForUserOne.name = UserSecondData.val().name
            messageDataForUserOne.profilePictureUrl = UserSecondData.val().profilePictureUrl


            if (messageDataForUserOne.receiverId + '' === test[1]) {
                userDeviceToken = UserSecondData.val().deviceToken

                let currentChat = UserSecondData.val().current_chat

                try {
                    const current_chat_split: String[] = currentChat.trim().split('_', 2);

                    if (current_chat_split.indexOf(test[0]) >= 0) {
                        isBadgeAddedSecond = false
                    } else {
                        isBadgeAddedSecond = true
                       }
                } catch (exception) {
                    console.log(exception)
                     isBadgeAddedSecond = true
                }


            } else {
                nameToNotify = UserSecondData.val().name
                profileToNotify=UserSecondData.val().profilePictureUrl
                messageDataForUserTwo.badge_count = +0
                isBadgeAddedSecond = false
            }
        })

        updates = [refUserInfoFirst, refUserInfoSecond]

        return Promise.all(updates).then(success => {

            updates = []

            const refReq1 = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/recent_chat/' + test[0] + '/' + test[1] + '/').once('value').then(badge => {

                if (isBadgeAddedFirst) {
                    try {

                        let badgeCount = badge.val().badge_count

                        badgeCount = badgeCount + 1

                        messageDataForUserOne.badge_count = badgeCount

                    } catch (exception) {

                        messageDataForUserOne.badge_count = +1
                    }
                } else {
                    messageDataForUserOne.badge_count = +0
                }

                const ref = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/recent_chat/' + test[0] + '/' + test[1] + '/')

                return ref.set(
                    messageDataForUserOne
                )

            })

            const refReq2 = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/recent_chat/' + test[1] + '/' + test[0] + '/').once('value').then(badge => {

                if (isBadgeAddedSecond) {
                    try {

                        let badgeCount = badge.val().badge_count

                        badgeCount = badgeCount + 1

                        messageDataForUserTwo.badge_count = badgeCount

                    } catch (exception) {

                        messageDataForUserTwo.badge_count = +1
                    }
                } else {
                    messageDataForUserTwo.badge_count = +0
                }

                const ref = snapShot.ref.root.child('6ZH8YQGNhnHzwO3Q_DEBUG/recent_chat/' + test[1] + '/' + test[0] + '/')

                return ref.set(
                    messageDataForUserTwo
                )
                
            })

            var message = {
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: "GreenNet",
                                body: messageDataForUserOne.message + '',
                                subtitle: nameToNotify + " has sent you message"
                            },
                            sound: '1',
                            badge: 0,
                        },
                        notification: {
                            senderId: messageDataForUserOne.senderId + '',
                            receiverId: messageDataForUserOne.receiverId + '',
                            name:nameToNotify,
                            profile:profileToNotify,
                            message: messageDataForUserOne.message + '',
                            body: nameToNotify,
                            type: "Chat"
                        }
                    }
                },
                android: {

                    data: {
                        senderId: messageDataForUserOne.senderId + '',
                        receiverId: messageDataForUserOne.receiverId + '',
                        message: messageDataForUserOne.message + '',
                        body: nameToNotify,
                        name:nameToNotify,
                        profile:profileToNotify,
                        title: nameToNotify + " has sent you message",
                        type: "Chat"
                    }
                },
                token: userDeviceToken
            };

            admin.messaging().send(message).then(suc => {
                console.log('Notification send Successfuly.' + suc)
            }).catch(errorr => {
                console.log('Notification Failed.' + userDeviceToken
                )
            })

            updates = [refReq1, refReq2]

            return Promise.all(updates)

        })
    })

    