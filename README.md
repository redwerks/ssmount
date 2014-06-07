# ssmount

For work I (Daniel) usually make use of OSX and I often have to mount specific directories from our servers to work on staging sites or client projects remotely. I've had issues in the past getting things like Transmit to mount disks so I've been using SSHFS. However because this works in the terminal and we use ACLs on the server which requires some extra options passed to the sshfs command, mounting things to work on has become tedious.

So I created ssmount, a simple tool for remembering and mounting SSHFS mount points you use regularly on OSX.

ssmount:

  * Lets you `ssmount add` SSHFS mounts you use regularly.
  * Allows you to mount them by simple names with `ssmount mount <name>`.
  * By default, passes options to sshfs that allow permissions to work correctly when the server uses ACLs.

## Getting Started
Ensure you have [node.js](http://nodejs.org/) installed.

Install the ssmount command with: `npm install ssmount -g` (you will probably need to use `sudo` or change ownership of `/usr/local`)

## License
Copyright (c) 2014 – Redwerks Systems Inc.
Licensed under the MIT license.
