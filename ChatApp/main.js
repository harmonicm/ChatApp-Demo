//#1
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

//#2
let config = {
    appid: 'f6bf10dc8bfe445ab399XXXXXXXX',
    token: '006f6bf10dc8bfe44XXXXXXXX',
    uid: null,
    channel: 'main demo'
}

//#3 - Setting tracks for when user joins
let localTracks = {
    audioTrack: null,
    videoTrack: null
}

//#4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
    audioTrackMuted: false,
    videoTrackMuted: false
}
//#5 - Set remote tracks to store other users
let remoteTracks = {}


if (document.getElementById('join-btn')) document.getElementById('join-btn').addEventListener("click", async () => {
    console.log('user joined stream')
    await joinStreams()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('footer').style.display = 'flex'
})


document.getElementById('mic-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if (!localTrackState.audioTrackMuted) {
        //Mute your audio
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)'
    } else {
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor = '#1f1f1f8e'

    }

})




document.getElementById('camera-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if (!localTrackState.videoTrackMuted) {
        //Mute your audio
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted = true
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)'
    } else {
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
        document.getElementById('camera-btn').style.backgroundColor = '#1f1f1f8e'

    }

})










document.getElementById('leave-btn').addEventListener('click', async () => {
    //Loop threw local tracks and stop them so unpublish event gets triggered, then set to undefined
    //Hide footer
    for (trackName in localTracks) {
        let track = localTracks[trackName]
        if (track) { //stop camera and mic
            track.stop()
            //disconnect from your camera and mic 
            track.close()
            localTracks[trackName] = null
        }
    }
    //Leave the channel
    await client.leave()
    document.getElementById('footer').style.display = 'none'
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('join-wrapper').style.display = 'block'
    //document.getElementById('join-btn').style.display = 'block'
})







//Method will take all my info and set user stream in frame
let joinStreams = async () => {
    //#12
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    //#6 - Set and get back tracks for local user
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appid, config.channel, config.token || null, config.uid || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
    ])

    let videoplayer = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid">${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                  </div>`

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoplayer);
    //document.getElementById('user-streams').insertAdjacentHTML('beforeend',videoplayer);
    //console.log(videoplayer);
    //#8 - Player user stream in div
    localTracks.videoTrack.play(`stream-${config.uid}`)

    //#9 Add user to user list of names/ids

    //#10 - Publish my local video tracks to entire channel so everyone can see it
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])
    //client.on("user-published", handleUserJoined);
}
let handleUserLeft = async () => {
    console.log('Handle user left!')
    //Remove from remote users and remove users video wrapper
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}

let handleUserJoined = async (user, mediaType) => {
    console.log('User has joined our stream')

    //#11 - Add user to list of remote users
    remoteTracks[user.uid] = user
    //#13 Subscribe ro remote users
    await client.subscribe(user, mediaType)

    // if (mediaType === 'video'){
    let videoplayer = document.getElementById(`video-wrapper-${user.uid}`)
    // console.log('player:', player)
    if (videoplayer != null) {
        videoplayer.remove()
    }



    if (mediaType === 'video') {
        let videoplayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid">${user.uid}</p>
                        <div class="video-player player" id="stream-${user.uid}"></div>
                  </div>`

        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoplayer);
        user.videoTrack.play(`stream-${user.uid}`)

    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}
