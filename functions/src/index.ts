import * as functions from 'firebase-functions'
import admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const basePathDevelopment = 'Chat_IC0NLT4A2A3SF54/1YQ4UYEBZHDBOKD_Development'
const basePathStaging = 'Chat_IC0NLT4A2A3SF54/6WKKV5JRLFTD0SM_Staging'
const basePathLive = 'Chat_IC0NLT4A2A3SF54/JQQ34QPTIRMUYM8_Release'


export const onGroupCreate = functions.database
    .ref('$(basePathDevelopment)/Groups/{whichNodes}/{GroupsId}').onCreate((snapShot, context) => {
        const groupDetail = snapShot.val()
        const whichNodes = context.params.whichNodes


export const onProfileUpdate = functions.database
    .ref('${basePathDevelopment}/Users/{userId}')
    .onUpdate((change, context) => {
        const before = change.before.val()
        const after = change.after.val()

        var isFirstNameChanged: Boolean = false
        var isLastNameChanged: Boolean = false
        var isEmailChanged: Boolean = false
        var isProfilePicChanged: Boolean = false
       
        if (before.first_name === after.first_name && 
            before.last_name === after.last_name && 
            before.email === after.email && 
            before.profile_pic === after.profile_pic) {
            return
        }
        // Check user detail is changed
        if (before.isFirstName !== after.isFirstName) {
            isFirstNameChanged = true
        }
        if (before.name !== after.name) {
            isLastNameChanged = true
        }
        if (before.name !== after.name) {
            isEmailChanged = true
        }
        if (before.profilePictureUrl !== after.profilePictureUrl) {
            isProfilePicChanged = true
        }  
        
        const afterId = after.id

        // If user detail is changed then update into  Members List
        const ref = change.after.ref.root.child("${basePathDevelopment}/Groups");

        const promises = ref.once('value').then(snapshot => {

            snapshot.forEach((group => {

                const refInner = ref.child("/" + group.key + "/members");

                refInner.once('value').then(snapshotMembers => {
                    
                    const updates: { [index: string]: any } = {};

                    snapshotMembers.forEach((member => {
                        refInner.once('value').then(MemberDetail => {
                            if (MemberDetail.key !== null) {
                                
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

    