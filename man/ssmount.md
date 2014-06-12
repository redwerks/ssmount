# ssmount(1) -- save and mount sshfs mounts

## SYNOPSIS

ssmount <command> [options]

## DESCRIPTION

ssmount is a simple tool for remembering and mounting SSHFS mount points you use regularly on OSX.

* ssmount lets you `ssmount add` SSHFS mounts you use regularly.
* Allows you to mount them by simple names with `mounts mount <name>`.
* By default, passes options to sshfs that allow permissions to work correctly when the server uses ACLs.

Run `ssmount help` to get a list of available commands,
and `ssmount help <command>` to get information on an individual command.

## HISTORY

For work I (Daniel) usually make use of OSX and I often have to mount specific directories from our servers to work on staging sites or client projects remotely. I've had issues in the past getting things like Transmit to mount disks so I've been using SSHFS. However because this works in the terminal and we use ACLs on the server which requires some extra options passed to the sshfs command, mounting things to work on has become tedious.

So I created ssmount so I could save the SSHFS mount points I use regularly and mount them when I need them.

## BUGS

When you find issues, please report them:

* [web:](https://github.com/redwerks/ssmount/issues)

## AUTHOR

* [Daniel Friesen](http://danielfriesen.name/)
* [Redwerks Systems Inc.](http://redwerks.org/)
